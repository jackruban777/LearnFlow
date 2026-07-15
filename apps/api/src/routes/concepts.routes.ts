import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { get, setEx, REDIS_KEYS } from '../lib/redis.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const conceptsRouter = Router();

// GET /:id - fetch concept with cached MDX content
conceptsRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const conceptId = req.params.id as string;
    const cacheKey = REDIS_KEYS.lessonCache(conceptId);

    let content: string | null = null;
    try {
      content = await get(cacheKey);
    } catch (err) {
      console.warn('⚠️ Redis error reading lesson cache:', (err as Error).message);
    }

    let concept: any = null;
    if (content) {
      try {
        concept = await prisma.concept.findUnique({ where: { id: conceptId } });
      } catch (err) {
        concept = mockDb.concepts.find(c => c.id === conceptId);
      }
      if (concept) {
        concept = { ...concept, lessonContent: content };
      }
    } else {
      try {
        concept = await prisma.concept.findUnique({ where: { id: conceptId } });
      } catch (err) {
        concept = mockDb.concepts.find(c => c.id === conceptId);
      }

      if (concept && concept.lessonContent) {
        try {
          await setEx(cacheKey, 24 * 60 * 60, concept.lessonContent); // Cache for 24 hours
        } catch (err) {
          // Ignore
        }
      }
    }

    if (!concept) {
      throw new AppError('Concept not found', 404, 'CONCEPT_NOT_FOUND');
    }

    // Attach user progress if available
    let progress = null;
    const userId = req.user!.id;
    try {
      progress = await prisma.conceptProgress.findUnique({
        where: { userId_conceptId: { userId, conceptId } }
      });
    } catch (err) {
      progress = mockDb.conceptProgress.find(cp => cp.userId === userId && cp.conceptId === conceptId) || null;
    }

    res.json({
      success: true,
      data: {
        ...concept,
        progress
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /:id/complete - mark concept as completed, award XP
conceptsRouter.post('/:id/complete', requireAuth, async (req, res, next) => {
  try {
    const conceptId = req.params.id as string;
    const userId = req.user!.id;
    const xpAwarded = 25; // standard XP for reading a concept

    let updatedProgress;
    let xpUpdated = false;

    try {
      // 1. Transaction to update progress, user XP, and create notification
      await prisma.$transaction(async (tx: any) => {
        // Find or create concept progress
        const existing = await tx.conceptProgress.findUnique({
          where: { userId_conceptId: { userId, conceptId } }
        });

        if (existing && (existing.status === 'PASSED' || existing.status === 'EXCELLENT')) {
          // Already passed/completed, don't award duplicate XP
          updatedProgress = existing;
          return;
        }

        updatedProgress = await tx.conceptProgress.upsert({
          where: { userId_conceptId: { userId, conceptId } },
          update: { status: 'PASSED', lastAttemptAt: new Date() },
          create: { userId, conceptId, status: 'PASSED', lastAttemptAt: new Date() }
        });

        // Award XP to user
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
          xpUpdated = true;
        }

        // Check if all concepts in this phase are complete, to unlock next step/notify
        const conceptDetails = await tx.concept.findUnique({
          where: { id: conceptId },
          include: { phase: { include: { concepts: true } } }
        });

        if (conceptDetails) {
          const phase = conceptDetails.phase;
          const allConceptIds = phase.concepts.map((c: any) => c.id);
          const passedCount = await tx.conceptProgress.count({
            where: {
              userId,
              conceptId: { in: allConceptIds },
              status: { in: ['PASSED', 'EXCELLENT'] }
            }
          });

          if (passedCount === allConceptIds.length) {
            // Mark Phase status in progress / ready for exam
            // Wait, we don't automatically unlock the next phase, the user must pass the exam/project/viva first.
            // But we can notify them!
            await tx.notification.create({
              data: {
                userId,
                type: 'XP_EARNED',
                title: 'Phase Concepts Completed! 📚',
                body: `You have completed all concepts in "${phase.title}". Go to the dashboard to take the Exam!`
              }
            });
          }
        }
      });
    } catch (dbErr) {
      console.warn('⚠️ DB transaction failed, using mockDb fallback:', (dbErr as Error).message);
      
      // Fallback update in mockDb
      const existing = mockDb.conceptProgress.find(cp => cp.userId === userId && cp.conceptId === conceptId);
      if (existing) {
        if (existing.status !== 'PASSED' && existing.status !== 'EXCELLENT') {
          existing.status = 'PASSED';
          existing.lastAttemptAt = new Date();
          xpUpdated = true;
        }
        updatedProgress = existing;
      } else {
        const newProgress = {
          id: `prog-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          conceptId,
          status: 'PASSED' as const,
          lastAttemptAt: new Date(),
          bestQuizScore: null,
          attemptCount: 1
        };
        mockDb.conceptProgress.push(newProgress);
        updatedProgress = newProgress;
        xpUpdated = true;
      }

      if (xpUpdated) {
        const mockUser = mockDb.findUserById(userId);
        if (mockUser) {
          mockUser.xp += xpAwarded;
          mockUser.level = Math.max(1, Math.floor(Math.sqrt(mockUser.xp / 100)) + 1);
          mockUser.updatedAt = new Date();
          // Push XP notification
          mockDb.pushNotification({
            userId,
            type: 'XP_EARNED',
            title: `+${xpAwarded} XP Earned! ⚡`,
            body: `Concept completed! You now have ${mockUser.xp} XP and are Level ${mockUser.level}.`,
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        progress: updatedProgress,
        xpAwarded: xpUpdated ? xpAwarded : 0
      },
      message: xpUpdated ? `Concept marked complete! Earned +${xpAwarded} XP.` : 'Concept already completed.'
    });
  } catch (error) {
    next(error);
  }
});
