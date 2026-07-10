import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { mockDb } from '../lib/mockDb.js';

export const skillsRouter = Router();

skillsRouter.get('/popular', async (req, res, next) => {
  try {
    let skillsList = [];
    try {
      skillsList = await prisma.skill.findMany({
        orderBy: { popularity: 'desc' },
        take: 12
      });

      if (skillsList.length === 0) {
        skillsList = mockDb.skills;
      }
    } catch (err) {
      console.warn('⚠️ DB query for popular skills failed, using mockDb:', (err as Error).message);
      skillsList = mockDb.skills;
    }

    const data = (skillsList as any[]).map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      learnerCount: s.popularity || Math.floor(Math.random() * 1500) + 200
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});

skillsRouter.get('/search', async (req, res, next) => {
  try {
    const query = (req.query['q'] as string || '').toLowerCase().trim();

    let skillsList = [];
    try {
      if (query) {
        skillsList = await prisma.skill.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } }
            ]
          }
        });
      } else {
        skillsList = await prisma.skill.findMany({ take: 20 });
      }

      if (skillsList.length === 0 && !query) {
        skillsList = mockDb.skills;
      }
    } catch (err) {
      console.warn('⚠️ DB query for search skills failed, searching mockDb:', (err as Error).message);
      skillsList = mockDb.skills;
    }

    if (query) {
      skillsList = (skillsList as any[]).filter((s: any) => 
        s.name.toLowerCase().includes(query) || 
        s.category.toLowerCase().includes(query)
      );
    }

    const data = (skillsList as any[]).map((s: any) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      description: s.description,
      learnerCount: s.popularity || Math.floor(Math.random() * 1500) + 200
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});
