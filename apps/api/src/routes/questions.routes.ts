import { Router } from 'express';
import { SubmitQuizSchema, QuizResult, ProgressStatus } from '@learnflow/shared';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { generateQuestions, getSeenQuestionIds } from '../services/ai/question.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const questionsRouter = Router();

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i]!;
    shuffled[i] = shuffled[j]!;
    shuffled[j] = temp;
  }
  return shuffled;
}


// GET /concept/:conceptId - fetch questions for a concept quiz
questionsRouter.get('/concept/:conceptId', requireAuth, async (req, res, next) => {
  try {
    const conceptId = req.params.conceptId;
    const userId = req.user!.id;

    // Fetch seen question IDs
    const seenIds = await getSeenQuestionIds(userId);

    let dbQuestions = [];
    try {
      dbQuestions = await prisma.question.findMany({
        where: {
          conceptId,
          id: { notIn: seenIds }
        }
      });

      if (dbQuestions.length < 4) {
        const needed = 4 - dbQuestions.length;
        
        // Count total questions generated in the database for this concept
        const totalCount = await prisma.question.count({ where: { conceptId } });

        // Retrieve existing questions to exclude their texts
        const existingQs = await prisma.question.findMany({
          where: { conceptId },
          select: { questionText: true }
        });
        const excludeTexts = existingQs.map((q: { questionText: string }) => q.questionText);

        const generated = await generateQuestions(conceptId!, needed, totalCount, excludeTexts);
        try {
          await prisma.question.createMany({
            data: generated.map((q: any) => ({
              id: q.id,
              conceptId,
              skillSlug: 'general',
              type: q.type,
              difficulty: q.difficulty,
              questionText: q.text,
              codeSnippet: q.codeSnippet,
              options: q.options || [],
              correctAnswer: q.correctAnswer,
              explanation: q.explanation
            }))
          });
          dbQuestions = await prisma.question.findMany({
            where: {
              conceptId,
              id: { notIn: seenIds }
            }
          });
        } catch (dbErr) {
          console.warn('⚠️ DB write for generated questions failed, writing to mockDb:', (dbErr as Error).message);
          mockDb.questions.push(...generated);
          dbQuestions = [...dbQuestions, ...generated];
        }
      }
    } catch (err) {
      console.warn('⚠️ DB query for questions failed, reading from mockDb:', (err as Error).message);
      
      const allConceptMockQs = mockDb.questions.filter((q: any) => q.conceptId === conceptId);
      dbQuestions = allConceptMockQs.filter((q: any) => !seenIds.includes(q.id));

      if (dbQuestions.length < 4) {
        const needed = 4 - dbQuestions.length;
        const totalCount = allConceptMockQs.length;
        const excludeTexts = allConceptMockQs.map((q: any) => q.text || q.questionText);
        
        const generated = await generateQuestions(conceptId!, needed, totalCount, excludeTexts);
        mockDb.questions.push(...generated);
        dbQuestions = [...dbQuestions, ...generated];
      }
    }

    // Limit to exactly 4 questions
    dbQuestions = dbQuestions.slice(0, 4);

    // Sanitize correct answers for the frontend to prevent cheating
    const sanitized = (dbQuestions as any[]).map((q: any) => {
      let options = q.options ? [...q.options] : [];
      if (options.length > 0) {
        options = shuffleArray(options);
      }
      return {
        id: q.id,
        conceptId: q.conceptId,
        text: q.questionText || (q as any).text,
        type: q.type,
        difficulty: q.difficulty,
        options,
        codeSnippet: q.codeSnippet
      };
    });

    res.json({
      success: true,
      data: sanitized
    });
  } catch (error) {
    next(error);
  }
});

// POST /quiz/submit - grade a quiz submission
questionsRouter.post('/quiz/submit', requireAuth, async (req, res, next) => {
  try {
    const validated = SubmitQuizSchema.parse(req.body);
    const userId = req.user!.id;
    const { conceptId, answers } = validated;
    const questionIds = answers.map(a => a.questionId);

    // 1. Fetch the specific questions the user actually answered
    let dbQuestions: any[] = [];
    try {
      dbQuestions = await prisma.question.findMany({
        where: { id: { in: questionIds } }
      });
    } catch (err) {
      console.warn('⚠️ DB query for questions failed, reading from mockDb:', (err as Error).message);
    }

    // Fill missing questions from mockDb
    const retrievedIds = dbQuestions.map(q => q.id);
    const missingIds = questionIds.filter(id => !retrievedIds.includes(id));
    if (missingIds.length > 0) {
      const mockQs = mockDb.questions.filter((q: any) => missingIds.includes(q.id));
      dbQuestions = [...dbQuestions, ...mockQs];
    }

    // 2. Grade the submission
    let correctCount = 0;
    const gradingBreakdown = (dbQuestions as any[]).map((q: any) => {
      // Find user answer
      const userAnsEntry = answers.find(a => a.questionId === q.id);
      const isCorrect = userAnsEntry ? userAnsEntry.answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase() : false;
      if (isCorrect) correctCount++;

      return {
        questionId: q.id,
        text: q.questionText || (q as any).text,
        userAnswer: userAnsEntry?.answer || '',
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect
      };
    });

    const totalQuestions = dbQuestions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    // PASS thresholds: PASS >= 70, EXCELLENT >= 90
    let result: QuizResult = 'FAIL';
    let progressStatus: ProgressStatus = 'FAILED';
    let xpAwarded = 0;

    if (score >= 90) {
      result = 'EXCELLENT';
      progressStatus = 'EXCELLENT';
      xpAwarded = 75; // XP_AWARDS.conceptQuizExcellent
    } else if (score >= 70) {
      result = 'PASS';
      progressStatus = 'PASSED';
      xpAwarded = 50; // XP_AWARDS.conceptQuizPass
    }

    let savedAttempt;
    try {
      await prisma.$transaction(async (tx: any) => {
        // Save quiz attempt
        savedAttempt = await tx.quizAttempt.create({
          data: {
            userId,
            conceptId,
            questionIds,
            answers: answers as any,
            score,
            result
          }
        });

        // Upsert ConceptProgress
        const existingProgress = await tx.conceptProgress.findUnique({
          where: { userId_conceptId: { userId, conceptId } }
        });

        // Only upgrade status, don't downgrade from EXCELLENT to PASSED
        const shouldUpdateStatus = 
          !existingProgress || 
          existingProgress.status === 'NOT_STARTED' || 
          existingProgress.status === 'IN_PROGRESS' || 
          existingProgress.status === 'FAILED' || 
          (existingProgress.status === 'PASSED' && progressStatus === 'EXCELLENT');

        await tx.conceptProgress.upsert({
          where: { userId_conceptId: { userId, conceptId } },
          update: {
            status: shouldUpdateStatus ? progressStatus : existingProgress.status,
            bestQuizScore: Math.max(existingProgress.bestQuizScore || 0, score),
            attemptCount: { increment: 1 },
            lastAttemptAt: new Date()
          },
          create: {
            userId,
            conceptId,
            status: progressStatus,
            bestQuizScore: score,
            attemptCount: 1,
            lastAttemptAt: new Date()
          }
        });

        // Award XP to user if score is passing and was not previously passed
        const hasPassedBefore = existingProgress && (existingProgress.status === 'PASSED' || existingProgress.status === 'EXCELLENT');
        if (xpAwarded > 0 && !hasPassedBefore) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (user) {
            const newXp = user.xp + xpAwarded;
            const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);

            await tx.user.update({
              where: { id: userId },
              data: {
                xp: newXp,
                level: newLevel,
                lastActivityAt: new Date()
              }
            });

            // Notification
            await tx.notification.create({
              data: {
                userId,
                type: result === 'EXCELLENT' ? 'LEVEL_UP' : 'XP_EARNED',
                title: result === 'EXCELLENT' ? 'Perfect Quiz! 🌟' : 'Quiz Passed! 📝',
                body: `You scored ${score}% on the quiz. Earned +${xpAwarded} XP!`
              }
            });
          }
        }
      });
      console.log('✅ Quiz attempt saved transactionally.');
    } catch (dbErr) {
      console.warn('⚠️ DB Transaction failed for quiz submission, writing to mockDb:', (dbErr as Error).message);
      
      // Save mock attempt
      savedAttempt = {
        id: `attempt-${Date.now()}`,
        userId,
        conceptId,
        questionIds,
        answers: answers as any,
        score,
        result,
        completedAt: new Date()
      };
      mockDb.quizAttempts.push(savedAttempt as any);

      // Save mock progress
      const existing = mockDb.conceptProgress.find(cp => cp.userId === userId && cp.conceptId === conceptId);
      const hasPassedBefore = existing && (existing.status === 'PASSED' || existing.status === 'EXCELLENT');
      
      if (existing) {
        existing.attemptCount += 1;
        existing.bestQuizScore = Math.max(existing.bestQuizScore || 0, score);
        existing.lastAttemptAt = new Date();
        if (!hasPassedBefore) {
          existing.status = progressStatus;
        } else if (existing.status === 'PASSED' && progressStatus === 'EXCELLENT') {
          existing.status = 'EXCELLENT';
        }
      } else {
        mockDb.conceptProgress.push({
          id: `prog-${Date.now()}`,
          userId,
          conceptId,
          status: progressStatus,
          lastAttemptAt: new Date(),
          bestQuizScore: score,
          attemptCount: 1
        });
      }

      // Update mock user XP
      if (xpAwarded > 0 && !hasPassedBefore) {
        const user = mockDb.findUserById(userId);
        if (user) {
          user.xp += xpAwarded;
          user.level = Math.max(1, Math.floor(Math.sqrt(user.xp / 100)) + 1);
          user.updatedAt = new Date();
          // Push quiz notification
          mockDb.pushNotification({
            userId,
            type: result === 'EXCELLENT' ? 'LEVEL_UP' : 'XP_EARNED',
            title: result === 'EXCELLENT' ? `Perfect Quiz! 🌟 +${xpAwarded} XP` : `Quiz Passed! 📝 +${xpAwarded} XP`,
            body: `You scored ${score}% on the quiz. You now have ${user.xp} total XP at Level ${user.level}!`,
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        score,
        result,
        correctCount,
        totalQuestions,
        xpAwarded,
        breakdown: gradingBreakdown
      },
      message: result === 'FAIL' 
        ? `You scored ${score}%. You need at least 70% to pass.` 
        : `Quiz completed successfully. You scored ${score}% and earned +${xpAwarded} XP.`
    });
  } catch (error) {
    next(error);
  }
});
