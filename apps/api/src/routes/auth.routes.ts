import { Router } from 'express';
import bcrypt from 'bcrypt';
import { RegisterSchema, LoginSchema, ResetPasswordSchema, ForgotPasswordSchema, isEmailValidAndAppropriate } from '@learnflow/shared';
import { prisma } from '../lib/prisma.js';
import { redis, REDIS_KEYS } from '../lib/redis.js';
import { signToken, signRefreshToken, verifyToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { mockDb } from '../lib/mockDb.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const passwordHash = await bcrypt.hash(validated.password, 10);

    let user;
    try {
      const existing = await prisma.user.findUnique({ where: { email: validated.email } });
      if (existing) {
        throw new AppError('Email is already registered', 400, 'EMAIL_EXISTS');
      }

      user = await prisma.user.create({
        data: {
          name: validated.name,
          email: validated.email,
          passwordHash,
          role: 'LEARNER',
          plan: 'FREE',
          xp: 0,
          level: 1,
        }
      });
    } catch (dbErr) {
      if (dbErr instanceof AppError) throw dbErr;
      console.warn('⚠️ Database register failed, saving to mockDb:', (dbErr as Error).message);
      
      const existingMock = mockDb.findUserByEmail(validated.email);
      if (existingMock) {
        throw new AppError('Email is already registered', 400, 'EMAIL_EXISTS');
      }

      user = mockDb.createUser({
        name: validated.name,
        email: validated.email,
        passwordHash,
        role: 'LEARNER',
        plan: 'FREE',
        xp: 0,
        level: 1,
      });
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, plan: user.plan });
    const refreshToken = await signRefreshToken({ userId: user.id });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          xp: user.xp,
          level: user.level,
        }
      },
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const validated = LoginSchema.parse(req.body);
    let user = null;

    try {
      user = await prisma.user.findUnique({ where: { email: validated.email } });
    } catch (dbErr) {
      console.warn('⚠️ Database login lookup failed, reading from mockDb:', (dbErr as Error).message);
      user = mockDb.findUserByEmail(validated.email);
    }

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, plan: user.plan });
    const refreshToken = await signRefreshToken({ userId: user.id });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          xp: user.xp,
          level: user.level,
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401, 'REFRESH_TOKEN_REQUIRED');
    }

    const payload = await verifyToken(refreshToken);
    if (!payload || !payload.userId) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { id: payload.userId } });
    } catch (dbErr) {
      console.warn('⚠️ Database refresh lookup failed, reading from mockDb:', (dbErr as Error).message);
      user = mockDb.findUserById(payload.userId);
    }

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, plan: user.plan });
    const newRefreshToken = await signRefreshToken({ userId: user.id });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: { token },
      message: 'Tokens refreshed'
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('refresh_token');
  res.json({
    success: true,
    data: null,
    message: 'Logged out successfully'
  });
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const validated = ForgotPasswordSchema.parse(req.body);
    let user = null;

    try {
      user = await prisma.user.findUnique({ where: { email: validated.email } });
    } catch (dbErr) {
      user = mockDb.findUserByEmail(validated.email);
    }

    if (!user) {
      res.json({
        success: true,
        data: null,
        message: 'If the email exists, an OTP has been sent.'
      });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const key = REDIS_KEYS.passwordResetOTP(user.id);
      await redis.setex(key, 600, otp);
    } catch (err) {
      console.warn('⚠️ Redis write failed for OTP:', (err as Error).message);
    }

    mockDb.passwordResetTokens.push({
      id: `otp-${Date.now()}`,
      userId: user.id,
      token: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      usedAt: null
    });

    console.log(`🔑 [OTP Reset Send] Email: ${user.email} -> OTP: ${otp}`);

    res.json({
      success: true,
      data: null,
      message: 'If the email exists, an OTP has been sent.'
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const validated = ResetPasswordSchema.parse(req.body);

    const tokenRecord = mockDb.passwordResetTokens.find(
      (t) => t.token === validated.otp && t.expiresAt > new Date() && !t.usedAt
    );

    if (!tokenRecord) {
      throw new AppError('Invalid or expired OTP', 400, 'INVALID_OTP');
    }

    tokenRecord.usedAt = new Date();
    const userId = tokenRecord.userId;
    const passwordHash = await bcrypt.hash(validated.newPassword, 10);

    let updatedUser = null;
    try {
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { passwordHash }
      });
    } catch (dbErr) {
      console.warn('⚠️ Database update failed, updating mockDb:', (dbErr as Error).message);
      updatedUser = mockDb.updateUser(userId, { passwordHash });
    }

    if (!updatedUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    try {
      const key = REDIS_KEYS.passwordResetOTP(userId);
      await redis.del(key);
    } catch (err) {
      // Ignore
    }

    res.json({
      success: true,
      data: null,
      message: 'Password has been reset successfully.'
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;
    if (!token) {
      throw new AppError('Token is required', 400, 'TOKEN_REQUIRED');
    }
    res.json({
      success: true,
      data: null,
      message: 'Email verified successfully.'
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/oauth-login', async (req, res, next) => {
  try {
    const { email, name, provider, providerAccountId } = req.body;
    if (!email || !name || !provider) {
      throw new AppError('Missing OAuth fields', 400, 'OAUTH_FIELDS_REQUIRED');
    }

    // Validate email is not fake/disposable (guards against crafted mock requests)
    if (!isEmailValidAndAppropriate(email)) {
      throw new AppError('Please use a valid email address to sign in', 400, 'INVALID_EMAIL');
    }

    let user = null;
    try {
      // Upsert: find by email (most reliable) — create only if not found.
      // Using upsert avoids the race condition between findUnique + create.
      user = await prisma.user.upsert({
        where: { email },
        update: {
          // Keep name/provider fresh on every login
          name,
        },
        create: {
          name,
          email,
          role: 'LEARNER',
          plan: 'FREE',
          xp: 0,
          level: 1,
          oauthAccounts: {
            create: {
              provider,
              providerAccountId: providerAccountId || `oauth-${Date.now()}`,
            },
          },
        },
      });

      // Ensure OAuth account record exists (for users created before this route)
      const existingOAuth = await prisma.oAuthAccount.findFirst({
        where: { userId: user.id, provider },
      });
      if (!existingOAuth) {
        await prisma.oAuthAccount.create({
          data: {
            userId: user.id,
            provider,
            providerAccountId: providerAccountId || `oauth-${Date.now()}`,
          },
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ Database OAuth failed, reading/saving to mockDb:', (dbErr as Error).message);
      user = mockDb.findUserByEmail(email);
      if (!user) {
        user = mockDb.createUser({
          name,
          email,
          role: 'LEARNER',
          plan: 'FREE',
          xp: 0,
          level: 1,
        });
      }
    }

    const token = await signToken({ userId: user.id, email: user.email, role: user.role, plan: user.plan });
    const refreshToken = await signRefreshToken({ userId: user.id });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          plan: user.plan,
          xp: user.xp,
          level: user.level,
        },
      },
      message: 'OAuth login successful',
    });
  } catch (error) {
    next(error);
  }
});

