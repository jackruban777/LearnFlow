import { VivaQuestion, VivaResult, Difficulty } from '@learnflow/shared';
import { isMockAiEnabled, getChatCompletion } from './openai.js';
import { redis, setJson, getJson, del } from '../../lib/redis.js';
import { prisma } from '../../lib/prisma.js';
import { mockDb } from '../../lib/mockDb.js';

interface RedisVivaSession {
  id: string;
  userId: string;
  phaseId: string;
  questions: VivaQuestion[];
  answers: { questionIndex: number; answer: string; score: number; feedback: string }[];
}

export async function startVivaSession(userId: string, phaseId: string): Promise<{ sessionId: string; questions: { question: string; difficulty: Difficulty }[] }> {
  let phaseTitle = 'General Foundations';
  try {
    const phase = await prisma.phase.findUnique({ where: { id: phaseId } });
    if (phase) {
      phaseTitle = phase.title;
    } else {
      const mockPhase = mockDb.phases.find((p: any) => p.id === phaseId);
      if (mockPhase) phaseTitle = mockPhase.title;
    }
  } catch (err) {
    const mockPhase = mockDb.phases.find((p: any) => p.id === phaseId);
    if (mockPhase) phaseTitle = mockPhase.title;
  }

  let questions: VivaQuestion[] = [];

  if (isMockAiEnabled) {
    questions = generateMockVivaQuestions(phaseTitle);
  } else {
    try {
      const systemPrompt = `You are a technical interviewer conducting a viva voice exam (oral exam) for: "${phaseTitle}".
Generate exactly 3 viva questions of increasing difficulty (EASY, MEDIUM, HARD).
For each question, provide a list of expected key points the candidate should mention.
You MUST respond with a JSON object strictly matching this schema:
{
  "questions": [
    {
      "question": string,
      "expectedKeyPoints": [string, string, ...],
      "difficulty": "EASY" | "MEDIUM" | "HARD"
    }
  ]
}
Return only the JSON object. Do not wrap in markdown tags.`;

      const responseText = await getChatCompletion([
        { role: 'system', content: systemPrompt }
      ], { response_format: { type: 'json_object' } });

      const parsed = JSON.parse(responseText.trim()) as { questions: VivaQuestion[] };
      questions = parsed.questions;
    } catch (err) {
      console.error('❌ OpenAI Viva question generation failed, using mock generator:', err);
      questions = generateMockVivaQuestions(phaseTitle);
    }
  }

  const sessionId = `viva_${Math.random().toString(36).substr(2, 9)}`;
  const sessionData: RedisVivaSession = {
    id: sessionId,
    userId,
    phaseId,
    questions,
    answers: []
  };

  // Cache in Redis for 1 hour (3600 seconds)
  try {
    await setJson(`viva:session:${sessionId}`, sessionData, 3600);
  } catch (err) {
    console.warn('⚠️ Redis connection error saving viva session. Storing in mock database instead.', (err as Error).message);
    // Fallback store in mockDb
    mockDb.vivaSessions.push({
      id: sessionId,
      userId,
      phaseId,
      turns: sessionData as any,
      totalScore: null,
      passed: null,
      completedAt: null,
      startedAt: new Date()
    });
  }

  return {
    sessionId,
    questions: questions.map((q: any) => ({
      question: q.question,
      difficulty: q.difficulty
    }))
  };
}

export async function evaluateVivaAnswer(
  userId: string,
  sessionId: string,
  questionIndex: number,
  answer: string
): Promise<any> {
  // Load session from Redis (or fallback mockDb)
  let session: RedisVivaSession | null = null;
  let isFallback = false;

  try {
    session = await getJson<RedisVivaSession>(`viva:session:${sessionId}`);
  } catch (err) {
    console.warn('⚠️ Redis error reading viva session. Searching mockDb.', (err as Error).message);
  }

  if (!session) {
    const dbSession = mockDb.vivaSessions.find((s: any) => s.id === sessionId);
    if (dbSession) {
      session = dbSession.turns as unknown as RedisVivaSession;
      isFallback = true;
    }
  }

  if (!session) {
    throw new Error('Viva session not found or expired.');
  }

  const question = session.questions[questionIndex];
  if (!question) {
    throw new Error('Invalid question index.');
  }

  let score = 0;
  let feedback = '';

  if (isMockAiEnabled) {
    // Generate realistic mock grading
    const wordCount = answer.split(/\s+/).length;
    score = Math.min(4 + Math.floor(wordCount / 10), 10); // score out of 10
    feedback = `Good answer. You covered some key elements. To get a perfect score, mention details regarding ${question.expectedKeyPoints.join(', ')}.`;
  } else {
    try {
      const systemPrompt = `You are a technical interviewer evaluating a student's verbal answer for this question:
Question: "${question.question}"
Expected Key Points: ${question.expectedKeyPoints.join(', ')}
Difficulty: ${question.difficulty}

Evaluate the user's answer: "${answer}"

You MUST respond with a JSON object strictly matching this schema:
{
  "score": number (0 to 10),
  "feedback": string (constructive feedback explaining what was good and what was missed)
}
Return only the JSON object. Do not wrap in markdown tags.`;

      const responseText = await getChatCompletion([
        { role: 'system', content: systemPrompt }
      ], { response_format: { type: 'json_object' } });

      const parsed = JSON.parse(responseText.trim()) as { score: number; feedback: string };
      score = parsed.score;
      feedback = parsed.feedback;
    } catch (err) {
      console.error('❌ OpenAI viva evaluation failed, falling back to basic scorer:', err);
      score = Math.min(5 + Math.floor(answer.length / 50), 10);
      feedback = 'The explanation is valid but could cover more edge cases.';
    }
  }

  // Update session answers
  session.answers.push({
    questionIndex,
    answer,
    score,
    feedback
  });

  const totalQuestions = session.questions.length;
  const isLastQuestion = session.answers.length === totalQuestions;

  if (isLastQuestion) {
    // Session is complete! Grade it fully.
    const sumScores = session.answers.reduce((sum, item) => sum + item.score, 0);
    const overallScore = Math.round((sumScores / (totalQuestions * 10)) * 100); // map to percentage (0 - 100)
    const passed = overallScore >= 60; // VIVA_PASS_THRESHOLD is 60

    const xpAwarded = passed ? 150 : 25; // XP_AWARDS.vivaCompleted = 150
    const interviewReadinessDelta = passed 
      ? (overallScore >= 90 ? 10 : 5) 
      : -3; // vivaExcellentDelta: 10, vivaPassDelta: 5, vivaFailDelta: -3

    const finalResult = {
      overallScore,
      passed,
      feedback: passed
        ? 'Congratulations! You passed the oral assessment. You showed a good conceptual grasp of the phase topics.'
        : 'You did not meet the pass score. We recommend reviewing the concept explanations and trying again.',
      questionScore: score * 10,
      questionFeedback: feedback,
      nextQuestion: null,
      currentQuestionIndex: questionIndex,
      xpAwarded,
      interviewReadinessDelta
    };

    // 1. Save to Postgres DB (with fallback to mockDb)
    try {
      await prisma.$transaction(async (tx: any) => {
        // Save session record
        await tx.vivaSession.create({
          data: {
            id: sessionId,
            userId,
            phaseId: session!.phaseId,
            turns: session as any,
            totalScore: overallScore,
            passed,
            completedAt: new Date(),
            startedAt: new Date()
          }
        });

        // Update User profile (XP + interviewReadinessScore)
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (user) {
          const newXp = user.xp + xpAwarded;
          // Calculate level progression
          const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1); // Simple scale or custom
          const newReadiness = Math.min(100, Math.max(0, user.interviewReadinessScore + interviewReadinessDelta));

          await tx.user.update({
            where: { id: userId },
            data: {
              xp: newXp,
              level: newLevel,
              interviewReadinessScore: newReadiness,
              lastActivityAt: new Date()
            }
          });

          // Add notification
          await tx.notification.create({
            data: {
              userId,
              type: 'VIVA_COMPLETE',
              title: passed ? 'Viva Oral Exam Passed! 🎙️' : 'Viva Oral Exam Completed',
              body: passed 
                ? `You passed the oral exam with ${overallScore}%. Earned +${xpAwarded} XP and +${interviewReadinessDelta} Interview Readiness!`
                : `You scored ${overallScore}%. Keep practicing to pass the viva exam next time.`
            }
          });
        }
      });
      console.log('✅ Viva session saved to database.');
    } catch (dbErr) {
      console.warn('⚠️ Database save failed, saving to mockDb:', (dbErr as Error).message);
      // Save to mockDb
      const index = mockDb.vivaSessions.findIndex(s => s.id === sessionId);
      const sessionRecord = {
        id: sessionId,
        userId,
        phaseId: session.phaseId,
        turns: session as any,
        totalScore: overallScore,
        passed,
        completedAt: new Date(),
        startedAt: new Date()
      };
      if (index > -1) {
        mockDb.vivaSessions[index] = sessionRecord;
      } else {
        mockDb.vivaSessions.push(sessionRecord);
      }

      // Update mock user
      const mockUser = mockDb.findUserById(userId);
      if (mockUser) {
        mockUser.xp += xpAwarded;
        mockUser.interviewReadinessScore = Math.min(100, Math.max(0, mockUser.interviewReadinessScore + interviewReadinessDelta));
        mockUser.updatedAt = new Date();
      }
    }

    // Clean up Redis
    try {
      await del(`viva:session:${sessionId}`);
    } catch (err) {
      // Ignore
    }

    return finalResult;
  } else {
    // Not final, save state to Redis and return temporary result
    try {
      if (isFallback) {
        const index = mockDb.vivaSessions.findIndex(s => s.id === sessionId);
        const existingSession = index > -1 ? mockDb.vivaSessions[index] : null;
        if (existingSession) {
          existingSession.turns = session as any;
        }
      } else {
        await setJson(`viva:session:${sessionId}`, session, 3600);
      }
    } catch (err) {
      // Ignore
    }

    const nextQuestion = session.questions[questionIndex + 1];
    return {
      overallScore: null,
      passed: null,
      feedback: null,
      questionScore: score * 10,
      questionFeedback: feedback,
      nextQuestion: nextQuestion ? {
        question: nextQuestion.question,
        expectedKeyPoints: nextQuestion.expectedKeyPoints,
        difficulty: nextQuestion.difficulty
      } : null,
      currentQuestionIndex: questionIndex + 1,
      xpAwarded: null,
      interviewReadinessDelta: null
    };
  }
}

function generateMockVivaQuestions(phaseTitle: string): VivaQuestion[] {
  return [
    {
      question: `Can you explain the main architectural patterns or lifecycle structures involved in: "${phaseTitle}"?`,
      expectedKeyPoints: ['component structures', 'rendering cycles', 'execution state'],
      difficulty: 'EASY'
    },
    {
      question: `How would you diagnose and debug memory leaks or high execution delays in a module built for "${phaseTitle}"?`,
      expectedKeyPoints: ['profiling tools', 'garbage collection', 'throttling/memoization'],
      difficulty: 'MEDIUM'
    },
    {
      question: `What security considerations or architectural trade-offs are involved when deploying a scaling system with "${phaseTitle}" to production?`,
      expectedKeyPoints: ['encryption/tokens', 'scaling CDNs/databases', 'vulnerability audits'],
      difficulty: 'HARD'
    }
  ];
}
