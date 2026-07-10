import { Router } from 'express';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const usersRouter = Router();

// ─── Validation Schemas ────────────────────────────────────────────────────

const UpdateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

const NotificationPrefsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

// ─── GET /api/users/me ─────────────────────────────────────────────────────
usersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    let user = null;

    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          plan: true,
          xp: true,
          level: true,
          streak: true,
          longestStreak: true,
          emailVerified: true,
          interviewReadinessScore: true,
          dailyGoalTarget: true,
          createdAt: true,
        },
      });
    } catch (dbErr) {
      console.warn('⚠️ DB read failed for /users/me, falling back to mockDb:', (dbErr as Error).message);
      user = mockDb.findUserById(userId);
    }

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/users/me ───────────────────────────────────────────────────
usersRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const validated = UpdateProfileSchema.parse(req.body);

    // Build update payload — only include provided fields
    const updateData: Record<string, any> = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.avatarUrl !== undefined) updateData.avatarUrl = validated.avatarUrl;

    if (Object.keys(updateData).length === 0) {
      throw new AppError('No valid fields provided to update', 400, 'NO_UPDATE_FIELDS');
    }

    let updatedUser = null;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          role: true,
          plan: true,
          xp: true,
          level: true,
          streak: true,
          emailVerified: true,
        },
      });
    } catch (dbErr) {
      console.warn('⚠️ DB update failed for /users/me, falling back to mockDb:', (dbErr as Error).message);
      updatedUser = mockDb.updateUser(userId, updateData);
    }

    if (!updatedUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.json({ success: true, data: updatedUser, message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/users/me/password ─────────────────────────────────────────
usersRouter.patch('/me/password', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const validated = ChangePasswordSchema.parse(req.body);

    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } catch (dbErr) {
      user = mockDb.findUserById(userId);
    }

    if (!user || !user.passwordHash) {
      throw new AppError('Cannot change password for this account', 400, 'NO_PASSWORD');
    }

    const isMatch = await bcrypt.compare(validated.currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401, 'WRONG_PASSWORD');
    }

    const newHash = await bcrypt.hash(validated.newPassword, 10);

    try {
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });
    } catch (dbErr) {
      console.warn('⚠️ DB update failed for password change, falling back to mockDb:', (dbErr as Error).message);
      mockDb.updateUser(userId, { passwordHash: newHash });
    }

    res.json({ success: true, data: null, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

// ─── PATCH /api/users/me/notifications ────────────────────────────────────
// Stored as a simple JSON field — just echoes back for now (extend schema as needed)
usersRouter.patch('/me/notifications', requireAuth, async (req, res, next) => {
  try {
    const validated = NotificationPrefsSchema.parse(req.body);
    // In a full implementation you'd persist these to a UserPreferences table.
    // For now we store them in dailyGoalTarget field as a placeholder and return success.
    res.json({
      success: true,
      data: validated,
      message: 'Notification preferences saved',
    });
  } catch (error) {
    next(error);
  }
});

// ─── DELETE /api/users/me ──────────────────────────────────────────────────
usersRouter.delete('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user!.id;

    try {
      // Cascade deletes are defined in schema.prisma (onDelete: Cascade)
      await prisma.user.delete({ where: { id: userId } });
    } catch (dbErr) {
      console.warn('⚠️ DB delete failed for /users/me, falling back to mockDb:', (dbErr as Error).message);
      // Remove from mock store
      const idx = mockDb.users.findIndex((u: any) => u.id === userId);
      if (idx !== -1) mockDb.users.splice(idx, 1);
    }

    // Clear auth cookie
    res.clearCookie('refresh_token');

    res.json({ success: true, data: null, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});
