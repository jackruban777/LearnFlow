import { Router } from 'express';
import { MASTERY_WEIGHTS, ProgressStatus } from '@learnflow/shared';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const progressRouter = Router();

// GET /dashboard - get aggregated user stats
progressRouter.get('/dashboard', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    let userRecord = null;
    let certCount = 0;
    let projectCount = 0;
    let activeSkills = 0;

    try {
      userRecord = await prisma.user.findUnique({ where: { id: userId } });
      if (!userRecord) {
        throw new Error('User not found in Postgres');
      }
      certCount = await prisma.certificate.count({ where: { userId } });
      projectCount = await prisma.project.count({ where: { userId, passed: true } });
      activeSkills = await prisma.userRoadmap.count({ where: { userId, status: 'ACTIVE' } });
    } catch (err) {
      console.warn('⚠️ DB query error on dashboard stats, using mockDb fallback:', (err as Error).message);
      userRecord = mockDb.findUserById(userId);
      
      // If user not in mockDb, create a default record for them
      if (!userRecord) {
        userRecord = mockDb.createUser({
          id: userId,
          name: 'User',
          email: 'user@learnflow.dev',
          role: 'LEARNER',
          plan: 'FREE',
          xp: 0,
          level: 1,
        });
      }
      
      certCount = mockDb.certificates.filter((c: any) => c.userId === userId).length;
      projectCount = mockDb.projects.filter((p: any) => p.userId === userId && p.passed).length;
      activeSkills = mockDb.userRoadmaps.filter((ur: any) => ur.userId === userId && ur.status === 'ACTIVE').length;
    }

    if (!userRecord) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        xp: userRecord.xp,
        level: userRecord.level,
        streak: userRecord.streak,
        longestStreak: userRecord.longestStreak || userRecord.streak,
        certCount,
        projectCount,
        activeSkills,
        interviewReadinessScore: userRecord.interviewReadinessScore || 0,
        dailyGoalProgress: userRecord.dailyGoalProgress || 0,
        dailyGoalTarget: userRecord.dailyGoalTarget || 50
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /skill/:id - calculate detailed skill mastery (id = roadmapId)
progressRouter.get('/skill/:id', requireAuth, async (req, res, next) => {
  try {
    const roadmapId = req.params.id;
    if (!roadmapId) {
      throw new AppError('Roadmap ID is required', 400, 'ROADMAP_ID_REQUIRED');
    }
    const userId = req.user!.id;

    // Fetch roadmap, phases, concepts and progress details
    let roadmap = null;
    let phases: any[] = [];
    let progressList: any[] = [];

    try {
      roadmap = await prisma.roadmap.findUnique({
        where: { id: roadmapId },
        include: { skill: true }
      });

      if (!roadmap) {
        throw new Error('Roadmap not found in Postgres');
      }

      if (roadmap) {
        phases = await prisma.phase.findMany({
          where: { roadmapId },
          include: {
            concepts: true
          }
        });

        const conceptIds = phases.flatMap((p: any) => p.concepts.map((c: any) => c.id));
        progressList = await prisma.conceptProgress.findMany({
          where: {
            userId,
            conceptId: { in: conceptIds }
          }
        });
      }
    } catch (err) {
      console.warn('⚠️ DB query error for detailed skill mastery, using mockDb:', (err as Error).message);
      roadmap = mockDb.roadmaps.find(r => r.id === roadmapId);
      if (roadmap) {
        phases = mockDb.phases.filter(p => p.roadmapId === roadmapId).map(p => ({
          ...p,
          concepts: mockDb.concepts.filter(c => c.phaseId === p.id)
        }));
        const conceptIds = phases.flatMap(p => p.concepts.map((c: any) => c.id));
        progressList = mockDb.conceptProgress.filter(cp => cp.userId === userId && conceptIds.includes(cp.conceptId));
      }
    }

    if (!roadmap) {
      throw new AppError('Roadmap not found', 404, 'ROADMAP_NOT_FOUND');
    }

    // ─────────────────────────────────────────────
    // Mastery Score Formula Calculations
    // ─────────────────────────────────────────────

    // 1. Knowledge Score (Theory quizzes average)
    // 2. Practical Score (Practical quizzes average)
    const theoryConcepts = phases.flatMap(p => p.concepts.filter((c: any) => c.type === 'THEORY' || c.type === 'BOTH' || !c.type));
    const practicalConcepts = phases.flatMap(p => p.concepts.filter((c: any) => c.type === 'PRACTICAL' || c.type === 'BOTH'));

    const getAvgScore = (conceptsArray: any[]) => {
      const scored = conceptsArray.map(c => {
        const prog = progressList.find(p => p.conceptId === c.id);
        return prog?.bestQuizScore || 0;
      });
      return scored.length > 0 ? scored.reduce((a, b) => a + b, 0) / scored.length : 0;
    };

    const knowledgeScore = getAvgScore(theoryConcepts);
    // If practical concepts is empty, fall back to general quizzes or a small fraction of overall
    const practicalScore = practicalConcepts.length > 0 ? getAvgScore(practicalConcepts) : knowledgeScore;

    // 3. 4. 5. Exam, Project, and Viva Scores aggregated dynamically
    const phaseIds = phases.map(p => p.id);
    let examAttempts: number[] = [];
    let projectAttempts: number[] = [];
    let vivaAttempts: number[] = [];

    if (phaseIds.length > 0) {
      try {
        const [dbExams, dbProjects, dbVivas] = await Promise.all([
          prisma.examAttempt.findMany({
            where: { userId, phaseId: { in: phaseIds } }
          }),
          prisma.project.findMany({
            where: { userId, phaseId: { in: phaseIds } }
          }),
          prisma.vivaSession.findMany({
            where: { userId, phaseId: { in: phaseIds } }
          })
        ]);

        examAttempts = phaseIds.map(phaseId => {
          const phaseExams = dbExams.filter(e => e.phaseId === phaseId);
          return phaseExams.length > 0 ? Math.max(...phaseExams.map(e => e.score)) : 0;
        });

        projectAttempts = phaseIds.map(phaseId => {
          const phaseProjects = dbProjects.filter(p => p.phaseId === phaseId);
          const sorted = [...phaseProjects].sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
          return sorted[0]?.totalScore || 0;
        });

        vivaAttempts = phaseIds.map(phaseId => {
          const phaseVivas = dbVivas.filter(v => v.phaseId === phaseId);
          const sorted = [...phaseVivas].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
          return sorted[0]?.totalScore || 0;
        });
      } catch (err) {
        console.warn('⚠️ DB query error for detailed skill progress, using mockDb fallback values:', (err as Error).message);
        examAttempts = phases.map(p => p.examScore || 0);
        projectAttempts = phases.map(p => p.projectScore || 0);
        vivaAttempts = phases.map(p => p.vivaScore || 0);
      }
    } else {
      examAttempts = [];
      projectAttempts = [];
      vivaAttempts = [];
    }

    const examScore = examAttempts.length > 0 ? examAttempts.reduce((a, b) => a + b, 0) / examAttempts.length : 0;
    const projectScore = projectAttempts.length > 0 ? projectAttempts.reduce((a, b) => a + b, 0) / projectAttempts.length : 0;
    const vivaScore = vivaAttempts.length > 0 ? vivaAttempts.reduce((a, b) => a + b, 0) / vivaAttempts.length : 0;

    // Weighted Formula
    const overallMastery = Math.round(
      (knowledgeScore * MASTERY_WEIGHTS.knowledge) +
      (practicalScore * MASTERY_WEIGHTS.practical) +
      (examScore * MASTERY_WEIGHTS.exam) +
      (projectScore * MASTERY_WEIGHTS.project) +
      (vivaScore * MASTERY_WEIGHTS.viva)
    );

    // Save calculated mastery score back to userRoadmap record for persistence
    try {
      await prisma.userRoadmap.update({
        where: { userId_roadmapId: { userId, roadmapId } },
        data: { masteryScore: overallMastery }
      });
    } catch (err) {
      console.warn('⚠️ DB update for UserRoadmap masteryScore failed, updating mockDb:', (err as Error).message);
      const mockEnroll = mockDb.userRoadmaps.find((ur: any) => ur.userId === userId && ur.roadmapId === roadmapId);
      if (mockEnroll) {
        mockEnroll.masteryScore = overallMastery;
      }
    }

    res.json({
      success: true,
      data: {
        roadmapId,
        skillName: (roadmap as any).skill?.name || (roadmap as any).skillName || 'Active Skill',
        overallMastery,
        breakdown: {
          knowledge: Math.round(knowledgeScore),
          practical: Math.round(practicalScore),
          exam: Math.round(examScore),
          project: Math.round(projectScore),
          viva: Math.round(vivaScore)
        },
        weights: MASTERY_WEIGHTS
      }
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /skill/:id - override course progress (mastery score)
progressRouter.patch('/skill/:id', requireAuth, async (req, res, next) => {
  try {
    const roadmapId = req.params.id as string;
    const userId = req.user!.id;
    const { masteryScore } = req.body;

    if (masteryScore === undefined || typeof masteryScore !== 'number') {
      throw new AppError('Mastery score must be a number', 400, 'INVALID_MASTERY_SCORE');
    }

    const score = Math.max(0, Math.min(100, masteryScore));
    const isCompleted = score >= 100;

    let updatedRoadmap = null;

    try {
      // 1. Update the user roadmap status and mastery score
      updatedRoadmap = await prisma.userRoadmap.update({
        where: { userId_roadmapId: { userId, roadmapId } },
        data: {
          masteryScore: score,
          status: isCompleted ? 'COMPLETED' : 'ACTIVE',
          completedAt: isCompleted ? new Date() : null
        }
      });

      // 2. Fetch phases and concepts for this roadmap
      const phases = await prisma.phase.findMany({
        where: { roadmapId },
        include: { concepts: true }
      });

      const conceptIds = phases.flatMap((p: any) => p.concepts.map((c: any) => c.id));
      const phaseIds = phases.map((p: any) => p.id);

      // 3. Mark concepts as completed if score is high
      const conceptsToCompleteCount = Math.round((score / 100) * conceptIds.length);

      for (let i = 0; i < conceptIds.length; i++) {
        const conceptId = conceptIds[i];
        const status = i < conceptsToCompleteCount ? 'PASSED' : 'NOT_STARTED';

        await prisma.conceptProgress.upsert({
          where: { userId_conceptId: { userId, conceptId } },
          update: { status, bestQuizScore: i < conceptsToCompleteCount ? 90 : 0 },
          create: { userId, conceptId, status, bestQuizScore: i < conceptsToCompleteCount ? 90 : 0 }
        });
      }

      // 4. Update phase exit exams/projects/vivas if completed
      for (const phaseId of phaseIds) {
        if (isCompleted) {
          // Exam
          await prisma.examAttempt.upsert({
            where: { id: `mock-exam-${userId}-${phaseId}` },
            update: { score: 95, passed: true },
            create: { id: `mock-exam-${userId}-${phaseId}`, userId, phaseId, score: 95, passed: true, answers: {}, questionIds: [] }
          }).catch(() => {});

          // Project
          await prisma.project.upsert({
            where: { id: `mock-proj-${userId}-${phaseId}` },
            update: { totalScore: 95, passed: true, status: 'SCORED' },
            create: { id: `mock-proj-${userId}-${phaseId}`, userId, phaseId, description: 'Manual Progress Override Project', repoUrl: 'https://github.com/user/repo', totalScore: 95, passed: true, status: 'SCORED' }
          }).catch(() => {});

          // Viva
          await prisma.vivaSession.upsert({
            where: { id: `mock-viva-${userId}-${phaseId}` },
            update: { totalScore: 95 },
            create: { id: `mock-viva-${userId}-${phaseId}`, userId, phaseId, totalScore: 95, turns: [] }
          }).catch(() => {});
        }
      }

    } catch (dbErr) {
      console.warn('⚠️ DB update for roadmap progress override failed, updating mockDb:', (dbErr as Error).message);
      
      const mockEnroll = mockDb.userRoadmaps.find((ur: any) => ur.userId === userId && ur.roadmapId === roadmapId);
      if (mockEnroll) {
        mockEnroll.masteryScore = score;
        mockEnroll.status = isCompleted ? 'COMPLETED' : 'ACTIVE';
        mockEnroll.completedAt = isCompleted ? new Date() : null;
      }

      const phases = mockDb.phases.filter(p => p.roadmapId === roadmapId);
      const phaseIds = phases.map(p => p.id);
      const concepts = mockDb.concepts.filter(c => phaseIds.includes(c.phaseId));

      const conceptsToCompleteCount = Math.round((score / 100) * concepts.length);
      concepts.forEach((concept, i) => {
        const status = i < conceptsToCompleteCount ? 'PASSED' : 'NOT_STARTED';
        const existingProgress = mockDb.conceptProgress.find(cp => cp.userId === userId && cp.conceptId === concept.id);
        if (existingProgress) {
          existingProgress.status = status;
          existingProgress.bestQuizScore = i < conceptsToCompleteCount ? 90 : 0;
        } else {
          mockDb.conceptProgress.push({
            id: `cp-${userId}-${concept.id}`,
            userId,
            conceptId: concept.id,
            status,
            bestQuizScore: i < conceptsToCompleteCount ? 90 : 0,
            lastAttemptAt: null,
            attemptCount: 0
          });
        }
      });

      if (isCompleted) {
        phases.forEach(phase => {
          phase.status = 'PASSED';
          phase.examScore = 95;
          phase.projectScore = 95;
          phase.projectStatus = 'SCORED';
          phase.vivaScore = 95;
        });
      }
    }

    res.json({
      success: true,
      message: 'Course progress updated successfully',
      data: {
        roadmapId,
        masteryScore: score,
        status: isCompleted ? 'COMPLETED' : 'ACTIVE'
      }
    });
  } catch (error) {
    next(error);
  }
});
