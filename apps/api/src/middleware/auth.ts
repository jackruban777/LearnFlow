import { Request, Response, NextFunction } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { get, REDIS_KEYS } from '../lib/redis.js';
import { AppError } from './errorHandler.js';

// Extend Express Request type locally
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        plan: string;
      };
    }
  }
}

const JWT_SECRET = new TextEncoder().encode(process.env['JWT_SECRET'] ?? 'super-secret-key-learnflow-ai-2026-auth');

export async function signToken(payload: { userId: string; email: string; role: string; plan: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: { userId: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string; plan: string; [key: string]: any };
  } catch (err) {
    return null;
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies) {
      token = req.cookies['access_token'] || req.cookies['token'];
    }

    if (!token) {
      throw new AppError('Authentication token is required', 401, 'UNAUTHORIZED');
    }

    const payload = await verifyToken(token);
    if (!payload) {
      throw new AppError('Invalid or expired authentication token', 401, 'UNAUTHORIZED');
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role || 'LEARNER',
      plan: payload.plan || 'FREE',
    };

    next();
  } catch (error) {
    next(error);
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies) {
      token = req.cookies['access_token'] || req.cookies['token'];
    }

    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        req.user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role || 'LEARNER',
          plan: payload.plan || 'FREE',
        };
      }
    }
    next();
  } catch (error) {
    next(error);
  }
}

export async function guestRoadmapLimit(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user) {
      // User is registered/logged in, let them pass this middleware (their limits are handled elsewhere)
      return next();
    }

    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = REDIS_KEYS.guestRoadmapCount(ip);

    // Get the count from Redis
    let count = 0;
    try {
      const countStr = await get(key);
      count = countStr ? parseInt(countStr, 10) : 0;
    } catch (err) {
      console.warn('⚠️ Redis error in guest limit check. Skipping limit constraint.', (err as Error).message);
      return next();
    }

    if (count >= 1) {
      throw new AppError(
        'Guest limit reached. You can only generate 1 roadmap as a guest. Please register to unlock more.',
        429,
        'GUEST_LIMIT_REACHED'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}
