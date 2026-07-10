import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const notificationsRouter = Router();

// GET / - fetch list of notifications
notificationsRouter.get('/', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    let notifications = [];

    try {
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch {
      // DB unavailable — fall back silently to in-memory store
      notifications = mockDb.notifications.filter(n => n.userId === userId);
    }

    // Populate mock onboarding notifications if list is empty
    if (notifications.length === 0) {
      const mockNotifs = [
        {
          id: `notif-welcome-${userId}`,
          userId,
          type: 'SYSTEM' as const,
          title: 'Welcome to LearnFlow! 🚀',
          body: 'We are thrilled to help you master new skills. Explore our Popular Skills to generate your first roadmap!',
          read: false,
          createdAt: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          id: `notif-streak-${userId}`,
          userId,
          type: 'STREAK_MILESTONE' as const,
          title: 'Mastery Streak Started! 🔥',
          body: 'You completed your first day. Study daily to maintain your learning streak!',
          read: false,
          createdAt: new Date()
        }
      ];

      mockNotifs.forEach(notif => {
        const exists = mockDb.notifications.some(n => n.id === notif.id);
        if (!exists) {
          mockDb.notifications.push(notif as any);
        }
      });

      notifications = mockDb.notifications.filter(n => n.userId === userId);
    }

    // Sort in-memory fallback
    const sortedNotifications = [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: sortedNotifications
    });
  } catch (error) {
    next(error);
  }
});

// PUT /:id/read - mark notification as read
notificationsRouter.put('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.user!.id;

    let updatedNotification = null;
    let existing = null;

    try {
      // First verify notification belongs to user
      existing = await prisma.notification.findFirst({
        where: { id, userId }
      });
    } catch (dbErr) {
      console.warn('⚠️ DB lookup for notification failed:', (dbErr as Error).message);
    }

    if (existing) {
      try {
        updatedNotification = await prisma.notification.update({
          where: { id },
          data: { read: true }
        });
      } catch (dbErr) {
        console.warn('⚠️ DB update for notification read failed, falling back to mockDb:', (dbErr as Error).message);
      }
    }

    // Fallback to mockDb if not found or DB operations failed
    if (!updatedNotification) {
      const mockNotif = mockDb.notifications.find(n => n.id === id && n.userId === userId);
      if (!mockNotif) {
        throw new AppError('Notification not found', 404, 'NOT_FOUND');
      }
      mockNotif.read = true;
      updatedNotification = mockNotif;
    }

    res.json({
      success: true,
      data: updatedNotification,
      message: 'Notification marked as read.'
    });
  } catch (error) {
    next(error);
  }
});
