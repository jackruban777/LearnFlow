import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { optionalAuth } from '../middleware/auth.js';
import { mockDb } from '../lib/mockDb.js';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', optionalAuth, async (req, res, next) => {
  try {
    const limit = parseInt(req.query['limit'] as string || '20', 10);

    let users: any[] = [];
    try {
      users = await prisma.user.findMany({
        orderBy: { xp: 'desc' },
        take: limit
      });
    } catch (err) {
      console.warn('⚠️ DB query for leaderboard failed, falling back to mockDb:', (err as Error).message);
      users = mockDb.users;
    }

    // Generate competitors to make leaderboard feel active
    if (users.length < 5) {
      const mockCompetitors = [
        { id: 'comp-1', name: 'Alex Rivera', xp: 2450, streak: 12, level: 8, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
        { id: 'comp-2', name: 'Devon Miller', xp: 1890, streak: 5, level: 6, avatarUrl: null },
        { id: 'comp-3', name: 'Sophia Chen', xp: 3200, streak: 28, level: 11, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        { id: 'comp-4', name: 'Marcus Brody', xp: 950, streak: 3, level: 4, avatarUrl: null },
        { id: 'comp-5', name: 'Elena Rostova', xp: 1520, streak: 8, level: 5, avatarUrl: null },
      ];

      mockCompetitors.forEach(comp => {
        const exists = mockDb.users.some(u => u.id === comp.id);
        if (!exists) {
          mockDb.createUser({
            id: comp.id,
            name: comp.name,
            email: `${comp.id}@learnflow.io`,
            xp: comp.xp,
            streak: comp.streak,
            level: comp.level,
            avatarUrl: comp.avatarUrl
          });
        }
      });
      users = mockDb.users;
    }

    const sortedUsers = [...users].sort((a, b) => b.xp - a.xp).slice(0, limit);

    // Map to LeaderboardEntry shape
    const data = sortedUsers.map((u, idx) => ({
      rank: idx + 1,
      userId: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      xp: u.xp,
      streak: u.streak,
      certCount: u.totalCerts || 0,
      weeklyXp: Math.round(u.xp * 0.18) // Simulated weekly XP proportional to total
    }));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
});
