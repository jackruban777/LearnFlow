import { Router } from 'express';
import { GenerateRoadmapSchema, ProgressStatus } from '@learnflow/shared';
import { prisma } from '../lib/prisma.js';
import { redis, REDIS_KEYS } from '../lib/redis.js';
import { requireAuth, optionalAuth, guestRoadmapLimit } from '../middleware/auth.js';
import { generateRoadmap } from '../services/ai/roadmap.service.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const roadmapRouter = Router();

// POST /generate - generates a roadmap, handles guest limits
roadmapRouter.post('/generate', optionalAuth, guestRoadmapLimit, async (req, res, next) => {
  try {
    const validated = GenerateRoadmapSchema.parse(req.body);
    const userId = req.user?.id || 'guest';

    // 1. Generate the raw roadmap details using AI (or cache/mock)
    const roadmapResult = await generateRoadmap(validated.skillName);

    // 2. Save it structurally so it can be enrolled in
    let savedRoadmap;
    try {
      // Find or create skill in Postgres
      const skillSlug = validated.skillName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
      let skill = await prisma.skill.findUnique({ where: { slug: skillSlug } });
      if (!skill) {
        skill = await prisma.skill.create({
          data: {
            name: validated.skillName,
            slug: skillSlug,
            category: 'General',
            description: roadmapResult.overview
          }
        });
      }

      // Create roadmap structure in database
      savedRoadmap = await prisma.roadmap.create({
        data: {
          skillId: skill.id,
          generatedFor: userId,
          estimatedWeeks: roadmapResult.estimatedWeeks,
          phases: {
            create: roadmapResult.phases.map((phase) => ({
              title: phase.title,
              order: phase.order,
              estimatedDays: phase.order * 7,
              concepts: {
                create: phase.concepts.map((concept) => ({
                  title: concept.title,
                  description: concept.description,
                  order: concept.order,
                  estimatedMinutes: concept.estimatedMinutes,
                  lessonContent: concept.content,
                  type: 'THEORY'
                }))
              }
            }))
          }
        },
        include: {
          phases: {
            include: {
              concepts: true
            }
          }
        }
      });

      if (userId !== 'guest') {
        await prisma.userRoadmap.create({
          data: {
            userId,
            roadmapId: savedRoadmap.id,
            status: 'ACTIVE'
          }
        });

        const allConcepts = savedRoadmap.phases.flatMap(p => p.concepts);
        if (allConcepts.length > 0) {
          await prisma.conceptProgress.createMany({
            data: allConcepts.map((c: any) => ({
              userId,
              conceptId: c.id,
              status: 'NOT_STARTED'
            })),
            skipDuplicates: true
          });
        }
      }
    } catch (dbErr) {
      console.warn('⚠️ Database disconnected during roadmap creation, saving to mockDb:', (dbErr as Error).message);
      savedRoadmap = saveRoadmapToMock(userId, roadmapResult);
    }

    // 3. If guest, track limit in Redis
    if (userId === 'guest') {
      try {
        const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
        const key = REDIS_KEYS.guestRoadmapCount(ip);
        await redis.incr(key);
        await redis.expire(key, 24 * 60 * 60); // 24 hour limit reset
      } catch (redisErr) {
        console.warn('⚠️ Redis error incrementing guest count:', (redisErr as Error).message);
      }
    }

    res.status(201).json({
      success: true,
      data: savedRoadmap,
      message: 'Roadmap generated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /enroll - enroll user in a specific roadmap
roadmapRouter.post('/enroll', requireAuth, async (req, res, next) => {
  try {
    const { roadmapId } = req.body;
    if (!roadmapId) {
      throw new AppError('Roadmap ID is required to enroll', 400, 'ROADMAP_ID_REQUIRED');
    }

    const userId = req.user!.id;
    let enrollment;

    try {
      // Check if user is already enrolled
      const existing = await prisma.userRoadmap.findUnique({
        where: { userId_roadmapId: { userId, roadmapId } }
      });

      if (existing) {
        res.json({
          success: true,
          data: existing,
          message: 'Already enrolled in this roadmap.'
        });
        return;
      }

      // Check if roadmap was generated for guest, and claim it if so
      const targetRoadmap = await prisma.roadmap.findUnique({ where: { id: roadmapId } });
      if (targetRoadmap && targetRoadmap.generatedFor === 'guest') {
        await prisma.roadmap.update({
          where: { id: roadmapId },
          data: { generatedFor: userId }
        });
      }

      // Create enrollment mapping
      enrollment = await prisma.userRoadmap.create({
        data: {
          userId,
          roadmapId,
          status: 'ACTIVE'
        },
        include: {
          roadmap: {
            include: {
              phases: {
                include: {
                  concepts: true
                }
              }
            }
          }
        }
      });

      // Create ConceptProgress entries for all concepts in the roadmap
      const concepts = await prisma.concept.findMany({
        where: { phase: { roadmapId } }
      });

      if (concepts.length > 0) {
        await prisma.conceptProgress.createMany({
          data: concepts.map((c: any) => ({
            userId,
            conceptId: c.id,
            status: 'NOT_STARTED'
          })),
          skipDuplicates: true
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ DB enrollment failed, using mockDb:', (dbErr as Error).message);
      
      // Look up target roadmap in mockDb
      const mockRoadmap = mockDb.roadmaps.find(r => r.id === roadmapId);
      if (mockRoadmap && mockRoadmap.generatedFor === 'guest') {
        mockRoadmap.generatedFor = userId;
      }

      // Save user roadmap enrollment in mockDb
      const existingMock = mockDb.userRoadmaps.find(ur => ur.userId === userId && ur.roadmapId === roadmapId);
      if (existingMock) {
        enrollment = existingMock;
      } else {
        enrollment = {
          id: `enroll-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          roadmapId,
          status: 'ACTIVE',
          startedAt: new Date(),
          completedAt: null,
          masteryScore: null,
          roadmap: mockRoadmap
        };
        mockDb.userRoadmaps.push(enrollment as any);

        // Prepopulate concept progress in mockDb
        const mockConcepts = mockDb.concepts.filter(c => {
          const ph = mockDb.phases.find(p => p.id === c.phaseId);
          return ph && ph.roadmapId === roadmapId;
        });

        mockConcepts.forEach(c => {
          const progressExists = mockDb.conceptProgress.some(cp => cp.userId === userId && cp.conceptId === c.id);
          if (!progressExists) {
            mockDb.conceptProgress.push({
              id: `prog-${Math.random().toString(36).substr(2, 9)}`,
              userId,
              conceptId: c.id,
              status: 'NOT_STARTED',
              lastAttemptAt: null,
              bestQuizScore: null,
              attemptCount: 0
            });
          }
        });
      }
    }

    res.json({
      success: true,
      data: enrollment,
      message: 'Enrolled in roadmap successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /user - fetch roadmaps user is enrolled in
roadmapRouter.get('/user', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    let roadmaps = [];

    try {
      const dbRoadmaps = await prisma.userRoadmap.findMany({
        where: { userId },
        include: {
          roadmap: {
            include: {
              skill: true,
              phases: {
                orderBy: { order: 'asc' },
                include: {
                  concepts: {
                    orderBy: { order: 'asc' }
                  }
                }
              }
            }
          }
        }
      });
      
      // If user exists in Postgres but has no roadmaps, this is fine, but if user is not in Postgres at all, we should fallback
      const userInDb = await prisma.user.findUnique({ where: { id: userId } });
      if (!userInDb) {
        throw new Error('User not found in Postgres');
      }

      const phaseIds = dbRoadmaps.flatMap((ur: any) => ur.roadmap.phases.map((p: any) => p.id));
      const { phaseProgressMap, conceptProgressMap } = phaseIds.length > 0
        ? await getPhasesProgress(userId, phaseIds)
        : { phaseProgressMap: new Map<string, any>(), conceptProgressMap: new Map<string, any>() };

      roadmaps = dbRoadmaps.map((ur: any) => {
        const transformedPhases = ur.roadmap.phases.map((phase: any) => {
          const phaseProg = phaseProgressMap.get(phase.id) || {
            status: 'NOT_STARTED',
            examScore: null,
            examAttempts: 0,
            projectStatus: null,
            projectScore: null,
            vivaScore: null
          };
          const transformedConcepts = phase.concepts.map((concept: any) => {
            const conceptProg: any = conceptProgressMap.get(concept.id);
            return {
              ...concept,
              status: conceptProg?.status ?? 'NOT_STARTED',
              bestQuizScore: conceptProg?.bestQuizScore ?? null,
              attemptCount: conceptProg?.attemptCount ?? 0
            };
          });
          return {
            ...phase,
            ...phaseProg,
            concepts: transformedConcepts
          };
        });
        return {
          ...ur,
          roadmap: {
            ...ur.roadmap,
            phases: transformedPhases
          }
        };
      });
    } catch (dbErr) {
      console.warn('⚠️ DB query for user roadmaps failed, using mockDb:', (dbErr as Error).message);
      
      const userEnrollments = mockDb.userRoadmaps.filter((ur: any) => ur.userId === userId);
      roadmaps = userEnrollments.map((enroll: any) => {
        const fullRoadmap = mockDb.roadmaps.find(r => r.id === enroll.roadmapId);
        const skill = fullRoadmap ? mockDb.skills.find(s => s.id === fullRoadmap.skillId) : null;
        const phases = mockDb.phases.filter(p => p.roadmapId === enroll.roadmapId);
        const phasesWithConcepts = phases.map(p => ({
          ...p,
          concepts: mockDb.concepts.filter(c => c.phaseId === p.id)
        }));

        return {
          ...enroll,
          roadmap: {
            ...fullRoadmap,
            skill: skill || { name: 'Unknown Skill', category: 'General' },
            phases: phasesWithConcepts
          }
        };
      });
    }

    res.json({
      success: true,
      data: roadmaps
    });
  } catch (error) {
    next(error);
  }
});

// GET /:id - fetch a single roadmap by ID
roadmapRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const roadmapId = req.params.id;
    const userId = req.user!.id;

    let userRoadmap = null;
    try {
      const dbUserRoadmap = await prisma.userRoadmap.findFirst({
        where: { userId, roadmapId },
        include: {
          roadmap: {
            include: {
              skill: true,
              phases: {
                orderBy: { order: 'asc' },
                include: {
                  concepts: {
                    orderBy: { order: 'asc' }
                  }
                }
              }
            }
          }
        }
      });

      if (!dbUserRoadmap) {
        throw new Error('Roadmap not found in Postgres');
      }

      if (dbUserRoadmap) {
        const phaseIds = dbUserRoadmap.roadmap.phases.map((p: any) => p.id);
        const { phaseProgressMap, conceptProgressMap } = await getPhasesProgress(userId, phaseIds);

        const transformedPhases = dbUserRoadmap.roadmap.phases.map((phase: any) => {
          const phaseProg = phaseProgressMap.get(phase.id) || {
            status: 'NOT_STARTED',
            examScore: null,
            examAttempts: 0,
            projectStatus: null,
            projectScore: null,
            vivaScore: null
          };
          const transformedConcepts = phase.concepts.map((concept: any) => {
            const conceptProg: any = conceptProgressMap.get(concept.id);
            return {
              ...concept,
              status: conceptProg?.status ?? 'NOT_STARTED',
              bestQuizScore: conceptProg?.bestQuizScore ?? null,
              attemptCount: conceptProg?.attemptCount ?? 0
            };
          });
          return {
            ...phase,
            ...phaseProg,
            concepts: transformedConcepts
          };
        });

        userRoadmap = {
          ...dbUserRoadmap,
          roadmap: {
            ...dbUserRoadmap.roadmap,
            phases: transformedPhases
          }
        };
      }
    } catch (err) {
      console.warn('⚠️ DB query for single roadmap failed, searching mockDb:', (err as Error).message);
      const mockEnrollment = mockDb.userRoadmaps.find((ur: any) => ur.userId === userId && ur.roadmapId === roadmapId);
      if (mockEnrollment) {
        const mockRoadmap = mockDb.roadmaps.find(r => r.id === roadmapId);
        const phases = mockDb.phases.filter(p => p.roadmapId === roadmapId);
        const phasesWithConcepts = phases.map(p => ({
          ...p,
          concepts: mockDb.concepts.filter(c => c.phaseId === p.id)
        }));

        userRoadmap = {
          ...mockEnrollment,
          roadmap: {
            ...mockRoadmap,
            skill: mockDb.skills.find(s => s.id === mockRoadmap?.skillId) || { name: 'Active Skill', category: 'General', description: 'Curriculum roadmap' },
            phases: phasesWithConcepts
          }
        };
      }
    }

    if (!userRoadmap) {
      throw new AppError('Enrolled roadmap not found', 404, 'ROADMAP_NOT_FOUND');
    }

    res.json({
      success: true,
      data: userRoadmap
    });
  } catch (error) {
    next(error);
  }
});

// Helper to dynamically aggregate phase and concept progress for a user
async function getPhasesProgress(userId: string, phaseIds: string[]) {
  // Query all database records for this user and these phases
  const [dbExams, dbProjects, dbVivas, concepts] = await Promise.all([
    prisma.examAttempt.findMany({
      where: { userId, phaseId: { in: phaseIds } }
    }),
    prisma.project.findMany({
      where: { userId, phaseId: { in: phaseIds } }
    }),
    prisma.vivaSession.findMany({
      where: { userId, phaseId: { in: phaseIds } }
    }),
    prisma.concept.findMany({
      where: { phaseId: { in: phaseIds } }
    })
  ]);

  const conceptIds = concepts.map(c => c.id);
  const conceptProgresses = conceptIds.length > 0
    ? await prisma.conceptProgress.findMany({
        where: { userId, conceptId: { in: conceptIds } }
      })
    : [];

  const phaseProgressMap = new Map();

  for (const phaseId of phaseIds) {
    const phaseExams = dbExams.filter((e: any) => e.phaseId === phaseId);
    const phaseProjects = dbProjects.filter((p: any) => p.phaseId === phaseId);
    const phaseVivas = dbVivas.filter((v: any) => v.phaseId === phaseId);
    const phaseConcepts = concepts.filter((c: any) => c.phaseId === phaseId);
    const phaseConceptProgs = conceptProgresses.filter((cp: any) => phaseConcepts.some((c: any) => c.id === cp.conceptId));

    const examAttemptsCount = phaseExams.length;
    const bestExamScore = phaseExams.length > 0 ? Math.max(...phaseExams.map((e: any) => e.score)) : null;
    const examPassed = phaseExams.some((e: any) => e.passed);

    // Latest project
    const sortedProjects = [...phaseProjects].sort((a: any, b: any) => b.submittedAt.getTime() - a.submittedAt.getTime());
    const latestProject = sortedProjects[0];
    const projectStatus = latestProject ? latestProject.status : null;
    const projectScore = latestProject ? latestProject.totalScore : null;

    // Latest viva
    const sortedVivas = [...phaseVivas].sort((a: any, b: any) => b.startedAt.getTime() - a.startedAt.getTime());
    const latestViva = sortedVivas[0];
    const vivaScore = latestViva ? latestViva.totalScore : null;

    const hasStartedConcepts = phaseConceptProgs.some((cp: any) => cp.status !== 'NOT_STARTED');

    let status = 'NOT_STARTED';
    if (examPassed) {
      status = 'PASSED';
    } else if (examAttemptsCount > 0 || projectStatus || phaseVivas.length > 0 || hasStartedConcepts) {
      status = 'IN_PROGRESS';
    }

    phaseProgressMap.set(phaseId, {
      status,
      examScore: bestExamScore,
      examAttempts: examAttemptsCount,
      projectStatus,
      projectScore,
      vivaScore
    });
  }

  // Also build concept progress lookup
  const conceptProgressMap = new Map(conceptProgresses.map((cp: any) => [cp.conceptId, cp]));

  return {
    phaseProgressMap,
    conceptProgressMap
  };
}

// Helper for Mock DB storage
function saveRoadmapToMock(userId: string, data: any) {
  const skillSlug = data.skillName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
  let mockSkill = mockDb.skills.find(s => s.slug === skillSlug);
  if (!mockSkill) {
    mockSkill = {
      id: `skill-${Math.random().toString(36).substr(2, 9)}`,
      name: data.skillName,
      slug: skillSlug,
      category: 'General',
      description: data.overview,
      iconUrl: null,
      popularity: 1,
      createdAt: new Date()
    };
    mockDb.skills.push(mockSkill);
  }

  const roadmapId = `road-${Math.random().toString(36).substr(2, 9)}`;
  const mockPhases: any[] = [];
  const mockConcepts: any[] = [];

  data.phases.forEach((phase: any) => {
    const phaseId = `phase-${Math.random().toString(36).substr(2, 9)}`;
    
    mockPhases.push({
      id: phaseId,
      roadmapId,
      title: phase.title,
      description: phase.description,
      order: phase.order,
      isUnlocked: phase.order === 1,
      status: 'NOT_STARTED',
      examScore: null,
      examAttempts: 0,
      projectStatus: null,
      projectScore: null,
      vivaScore: null,
      masteryScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    phase.concepts.forEach((concept: any) => {
      const conceptId = `concept-${Math.random().toString(36).substr(2, 9)}`;
      
      const newConcept = {
        id: conceptId,
        phaseId,
        title: concept.title,
        description: concept.description,
        content: concept.content,
        order: concept.order,
        difficulty: concept.difficulty,
        estimatedMinutes: concept.estimatedMinutes,
        status: 'NOT_STARTED' as ProgressStatus,
        quizScore: null,
        quizAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        lessonContent: concept.content
      };
      
      mockConcepts.push(newConcept);
      mockDb.concepts.push(newConcept);
    });
  });

  const mockRoadmap = {
    id: roadmapId,
    skillId: mockSkill.id,
    generatedFor: userId,
    estimatedWeeks: data.estimatedWeeks,
    createdAt: new Date()
  };

  mockDb.roadmaps.push(mockRoadmap as any);
  mockDb.phases.push(...mockPhases);

  if (userId !== 'guest') {
    mockDb.userRoadmaps.push({
      id: `enroll-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      roadmapId,
      status: 'ACTIVE',
      startedAt: new Date(),
      completedAt: null,
      masteryScore: 0,
      roadmap: mockRoadmap
    } as any);

    mockConcepts.forEach(c => {
      mockDb.conceptProgress.push({
        id: `prog-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        conceptId: c.id,
        status: 'NOT_STARTED',
        lastAttemptAt: null,
        bestQuizScore: null,
        attemptCount: 0
      });
    });
  }

  return {
    ...mockRoadmap,
    phases: mockPhases.map(p => ({
      ...p,
      concepts: mockConcepts.filter(c => c.phaseId === p.id)
    }))
  };
}
