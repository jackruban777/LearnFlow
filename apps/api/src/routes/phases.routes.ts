import { Router } from 'express';
import { SubmitExamSchema, SubmitProjectSchema, VivaAnswerSchema, ProgressStatus, ProjectStatus } from '@learnflow/shared';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { generateQuestions, getSeenQuestionIds } from '../services/ai/question.service.js';
import { evaluateProject } from '../services/ai/project.service.js';
import { startVivaSession, evaluateVivaAnswer } from '../services/ai/viva.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const phasesRouter = Router();

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


// GET /:id/exam - fetch exam questions
phasesRouter.get('/:id/exam', requireAuth, async (req, res, next) => {
  try {
    const phaseId = req.params.id as string;
    const userId = req.user!.id;

    // Retrieve seen question IDs
    const seenIds = await getSeenQuestionIds(userId);

    let concepts = [];
    try {
      concepts = await prisma.concept.findMany({ where: { phaseId } });
    } catch (err) {
      concepts = mockDb.concepts.filter(c => c.phaseId === phaseId);
    }

    if (concepts.length === 0) {
      throw new AppError('No concepts found for this phase. Cannot construct exam.', 400, 'EXAM_BUILD_FAILED');
    }

    let examQuestions: any[] = [];
    for (const concept of concepts) {
      let conceptQs = [];
      try {
        // Find unseen questions for this concept
        conceptQs = await prisma.question.findMany({
          where: {
            conceptId: concept.id,
            id: { notIn: seenIds }
          }
        });

        if (conceptQs.length < 2) {
          const needed = 2 - conceptQs.length;

          // Count total questions generated in the database for this concept
          const totalCount = await prisma.question.count({ where: { conceptId: concept.id } });

          // Retrieve existing questions to exclude their texts in the generator
          const existingQs = await prisma.question.findMany({
            where: { conceptId: concept.id },
            select: { questionText: true }
          });
          const excludeTexts = existingQs.map((q: { questionText: string }) => q.questionText);

          const generated = await generateQuestions(concept.id, needed, totalCount, excludeTexts);
          try {
            await prisma.question.createMany({
              data: generated.map(q => ({
                id: q.id,
                conceptId: concept.id,
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
            conceptQs = await prisma.question.findMany({
              where: {
                conceptId: concept.id,
                id: { notIn: seenIds }
              }
            });
          } catch (dbErr) {
            mockDb.questions.push(...generated);
            conceptQs = [...conceptQs, ...generated];
          }
        }
      } catch (err) {
        console.warn('⚠️ DB query for questions failed, using mockDb:', (err as Error).message);
        const allConceptMockQs = mockDb.questions.filter(q => q.conceptId === concept.id);
        conceptQs = allConceptMockQs.filter(q => !seenIds.includes(q.id));

        if (conceptQs.length < 2) {
          const needed = 2 - conceptQs.length;
          const totalCount = allConceptMockQs.length;
          const excludeTexts = allConceptMockQs.map((q: any) => q.text || q.questionText);

          const generated = await generateQuestions(concept.id, needed, totalCount, excludeTexts);
          mockDb.questions.push(...generated);
          conceptQs = [...conceptQs, ...generated];
        }
      }
      examQuestions.push(...conceptQs);
    }

    // Limit to exactly 5 questions for the exam
    const finalQuestions = examQuestions.slice(0, 5);

    const sanitizeQuestions = finalQuestions.map(q => {
      let options = q.options ? [...q.options] : [];
      if (options.length > 0) {
        options = shuffleArray(options);
      }
      return {
        id: q.id,
        conceptId: q.conceptId,
        text: q.questionText || q.text,
        type: q.type,
        difficulty: q.difficulty,
        options,
        codeSnippet: q.codeSnippet
      };
    });

    res.json({
      success: true,
      data: sanitizeQuestions
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/exam/submit - grade phase exam
phasesRouter.post('/:id/exam/submit', requireAuth, async (req, res, next) => {
  try {
    const phaseId = req.params.id as string;
    const userId = req.user!.id;
    const validated = SubmitExamSchema.parse(req.body);
    const { answers } = validated;
    const questionIds = answers.map(a => a.questionId);

    let concepts = [];
    try {
      concepts = await prisma.concept.findMany({ where: { phaseId } });
    } catch (err) {
      concepts = mockDb.concepts.filter((c: any) => c.phaseId === phaseId);
    }

    const conceptIds = concepts.map((c: any) => c.id);

    // 1. Fetch only the specific questions the user actually answered
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
      const mockQs = mockDb.questions.filter(q => missingIds.includes(q.id));
      dbQuestions = [...dbQuestions, ...mockQs];
    }

    let correctCount = 0;
    const gradedBreakdown: any[] = [];
    const weakConceptIds: string[] = [];

    answers.forEach((ans: any) => {
      const q = (dbQuestions as any[]).find((dbq: any) => dbq.id === ans.questionId);
      if (!q) return;

      const isCorrect = q.correctAnswer.trim().toLowerCase() === ans.answer.trim().toLowerCase();
      if (isCorrect) {
        correctCount++;
      } else {
        if (q.conceptId) weakConceptIds.push(q.conceptId);
      }

      gradedBreakdown.push({
        questionId: q.id,
        text: q.questionText || q.text,
        userAnswer: ans.answer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        isCorrect
      });
    });

    const totalQuestions = answers.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= 70; // EXAM_PASS_THRESHOLD = 70

    let xpAwarded = 0;
    if (passed) {
      xpAwarded = score >= 95 ? 350 : 200; // phaseExamPerfect or phaseExamPass
    }

    let recoveryPlan = null;
    if (!passed && weakConceptIds.length > 0) {
      const weakConceptsList = concepts.filter((c: any) => weakConceptIds.includes(c.id));
      recoveryPlan = {
        summary: 'It looks like you struggled with some core concepts in this phase. Here is a guided recovery pathway.',
        weakAreas: weakConceptsList.map((c: any) => c.title),
        steps: weakConceptsList.map((c: any) => ({
          conceptTitle: c.title,
          action: `Reread lesson content and practice quiz questions on "${c.title}".`,
          priority: 'HIGH' as const,
          estimatedMinutes: c.estimatedMinutes || 45
        })),
        estimatedRecoveryDays: 3,
        encouragement: 'Do not worry! Review the materials and you will easily pass next time.'
      };
    }

    try {
      await prisma.$transaction(async (tx: any) => {
        await tx.examAttempt.create({
          data: {
            userId,
            phaseId,
            questionIds,
            answers: answers as any,
            score,
            passed,
            weakConcepts: weakConceptIds as any,
            recoveryPlan: recoveryPlan as any
          }
        });

        if (passed) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (user) {
            const newXp = user.xp + xpAwarded;
            const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
            await tx.user.update({
              where: { id: userId },
              data: { xp: newXp, level: newLevel }
            });

            await tx.notification.create({
              data: {
                userId,
                type: 'PHASE_COMPLETE',
                title: 'Phase Exam Passed! 🎉',
                body: `You passed the Phase exam with ${score}%. Earned +${xpAwarded} XP!`
              }
            });

            // Issue Certificate
            const phase = await tx.phase.findUnique({
              where: { id: phaseId },
              include: {
                roadmap: {
                  include: { skill: true }
                }
              }
            });

            const skillName = phase?.roadmap?.skill?.name || 'General Skill';
            const phaseTitle = phase?.title || 'Completed Phase';
            const skillSlug = phase?.roadmap?.skill?.slug || 'gen';
            const certCode = `LF-${skillSlug.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            await tx.certificate.create({
              data: {
                userId,
                phaseId,
                certCode,
                skillName,
                phaseTitle,
                masteryScore: score
              }
            });

            await tx.notification.create({
              data: {
                userId,
                type: 'CERTIFICATE_ISSUED',
                title: 'New Certificate Issued! 🎓',
                body: `Congratulations! You've earned a certificate for completing "${phaseTitle}" of ${skillName}.`,
                data: { certCode } as any
              }
            });
          }
        }
      });
    } catch (dbErr) {
      console.warn('⚠️ DB Transaction failed for exam submission, saving to mockDb:', (dbErr as Error).message);
      
      const savedAttempt = {
        id: `exam-attempt-${Date.now()}`,
        userId,
        phaseId,
        questionIds,
        answers: answers as any,
        score,
        passed,
        weakConcepts: weakConceptIds,
        recoveryPlan,
        completedAt: new Date()
      };
      mockDb.examAttempts.push(savedAttempt);

      const mockPhase = mockDb.phases.find(p => p.id === phaseId);
      if (mockPhase) {
        mockPhase.examAttempts += 1;
        mockPhase.examScore = score;
        mockPhase.status = passed ? 'PASSED' : 'FAILED';
        mockPhase.updatedAt = new Date();
      }

      if (passed) {
        const user = mockDb.findUserById(userId);
        if (user) {
          user.xp += xpAwarded;
          user.level = Math.max(1, Math.floor(Math.sqrt(user.xp / 100)) + 1);
          user.updatedAt = new Date();
          
          // Generate certificate mock
          const mockPhaseDetail = mockDb.phases.find((p: any) => p.id === phaseId);
          const mockRoadmap = mockDb.roadmaps.find((r: any) => r.id === mockPhaseDetail?.roadmapId);
          const mockSkill = mockDb.skills.find((s: any) => s.id === mockRoadmap?.skillId);
          
          const skillName = mockSkill?.name || mockRoadmap?.skillName || 'General Skill';
          const phaseTitle = mockPhaseDetail?.title || 'Completed Phase';
          const skillSlug = mockSkill?.slug || 'gen';
          const certCode = `LF-${skillSlug.substring(0, 3).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

          const roadmapId = mockPhaseDetail?.roadmapId || 'unknown-roadmap';
          const mockCert = {
            id: `cert-${Date.now()}`,
            userId,
            roadmapId,
            phaseId,
            skillName,
            phaseTitle,
            masteryScore: score,
            certificateUrl: null,
            verificationCode: certCode,
            issuedAt: new Date()
          } as any;
          mockDb.certificates.push(mockCert);

          // Push progress notification
          mockDb.pushNotification({
            userId,
            type: 'PHASE_COMPLETE',
            title: 'Phase Exam Passed! 🎉',
            body: `You passed the Phase Exam with ${score}% and earned +${xpAwarded} XP! Level ${user.level} reached.`,
          });

          // Push certificate issued notification
          mockDb.pushNotification({
            userId,
            type: 'CERTIFICATE_ISSUED',
            title: 'New Certificate Issued! 🎓',
            body: `Congratulations! You've earned a certificate for completing "${phaseTitle}" of ${skillName}.`,
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        score,
        passed,
        xpAwarded,
        recoveryPlan,
        breakdown: gradedBreakdown
      },
      message: passed 
        ? `Congratulations! You passed the Phase Exam with ${score}%. Earned +${xpAwarded} XP.` 
        : `You scored ${score}%. A recovery plan has been generated to help you study.`
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/project/submit - queue project for evaluation
phasesRouter.post('/:id/project/submit', requireAuth, async (req, res, next) => {
  try {
    const phaseId = req.params.id as string;
    const userId = req.user!.id;
    const validated = SubmitProjectSchema.parse(req.body);

    let projectRecord;
    try {
      projectRecord = await prisma.project.create({
        data: {
          userId,
          phaseId,
          repoUrl: validated.repoUrl,
          description: validated.description || '',
          techStack: validated.techStack,
          screenshotUrls: validated.screenshotUrls,
          status: 'PENDING'
        }
      });
    } catch (dbErr) {
      console.warn('⚠️ DB create failed for project, saving to mockDb:', (dbErr as Error).message);
      projectRecord = {
        id: `proj-sub-${Date.now()}`,
        userId,
        phaseId,
        repoUrl: validated.repoUrl,
        description: validated.description ?? null,
        screenshotUrls: validated.screenshotUrls || [],
        techStack: validated.techStack,
        status: 'PENDING' as ProjectStatus,
        evaluation: null,
        totalScore: null,
        passed: null,
        submittedAt: new Date(),
        evaluatedAt: null
      };
      mockDb.projects.push(projectRecord);
    }

    // Evaluate Project synchronously
    const evaluation = await evaluateProject(phaseId, validated.repoUrl, validated.description ?? '', validated.techStack);

    try {
      await prisma.$transaction(async (tx: any) => {
        await tx.project.update({
          where: { id: projectRecord.id },
          data: {
            status: evaluation.passed ? 'SCORED' : 'FAILED',
            evaluation: evaluation as any,
            totalScore: evaluation.overallScore,
            passed: evaluation.passed,
            evaluatedAt: new Date()
          }
        });

        if (evaluation.passed) {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (user) {
            const newXp = user.xp + evaluation.xpAwarded;
            const newLevel = Math.max(1, Math.floor(Math.sqrt(newXp / 100)) + 1);
            await tx.user.update({
              where: { id: userId },
              data: {
                xp: newXp,
                level: newLevel,
                totalProjects: { increment: 1 }
              }
            });

            await tx.notification.create({
              data: {
                userId,
                type: 'PROJECT_EVALUATED',
                title: 'Project Evaluated! 🚀',
                body: `Your project passed static evaluation with ${evaluation.overallScore}%. Earned +${evaluation.xpAwarded} XP!`
              }
            });
          }
        }
      });
    } catch (dbErr) {
      console.warn('⚠️ DB update failed for project evaluation, updating mockDb:', (dbErr as Error).message);
      
      const pIndex = mockDb.projects.findIndex(p => p.id === projectRecord.id);
      const updatedProject = {
        ...projectRecord,
        status: evaluation.passed ? ('SCORED' as const) : ('FAILED' as const),
        evaluation: evaluation as any,
        totalScore: evaluation.overallScore,
        passed: evaluation.passed,
        evaluatedAt: new Date()
      };
      if (pIndex > -1) {
        mockDb.projects[pIndex] = updatedProject;
      }

      const mockPhase = mockDb.phases.find(p => p.id === phaseId);
      if (mockPhase) {
        mockPhase.projectStatus = evaluation.passed ? 'SCORED' : 'FAILED';
        mockPhase.projectScore = evaluation.overallScore;
      }

      if (evaluation.passed) {
        const user = mockDb.findUserById(userId);
        if (user) {
          user.xp += evaluation.xpAwarded;
          user.level = Math.max(1, Math.floor(Math.sqrt(user.xp / 100)) + 1);
          user.totalProjects += 1;
          // Push progress notification
          mockDb.pushNotification({
            userId,
            type: 'PROJECT_EVALUATED',
            title: 'Project Scored! 🚀',
            body: `Your project passed with ${evaluation.overallScore}% and earned +${evaluation.xpAwarded} XP!`,
          });
        }
      }
    }

    res.json({
      success: true,
      data: evaluation,
      message: evaluation.passed
        ? `Project submission successful! Passed with score: ${evaluation.overallScore}%.`
        : `Project evaluated but failed to pass. Score: ${evaluation.overallScore}%.`
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/viva/start - start oral session
phasesRouter.post('/:id/viva/start', requireAuth, async (req, res, next) => {
  try {
    const phaseId = req.params.id as string;
    const userId = req.user!.id;

    const sessionInfo = await startVivaSession(userId, phaseId);

    // Map to what the frontend expects (VivaStartResponse)
    const responseData = {
      id: sessionInfo.sessionId,
      currentQuestion: sessionInfo.questions[0],
      questionIndex: 0,
      totalQuestions: sessionInfo.questions.length
    };

    res.json({
      success: true,
      data: responseData,
      message: 'Viva oral session initialized. Answer questions one by one.'
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/viva/answer - submit viva answer
phasesRouter.post('/:id/viva/answer', requireAuth, async (req, res, next) => {
  try {
    const validated = VivaAnswerSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await evaluateVivaAnswer(userId, validated.vivaSessionId, validated.questionIndex, validated.answer);

    res.json({
      success: true,
      data: result,
      message: result.passed !== null 
        ? 'Viva session finalized successfully.'
        : `Answer for question ${validated.questionIndex + 1} graded.`
    });
  } catch (error) {
    next(error);
  }
});
