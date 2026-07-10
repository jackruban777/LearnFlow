import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth.routes.js';
import { skillsRouter } from './routes/skills.routes.js';
import { roadmapRouter } from './routes/roadmap.routes.js';
import { conceptsRouter } from './routes/concepts.routes.js';
import { questionsRouter } from './routes/questions.routes.js';
import { progressRouter } from './routes/progress.routes.js';
import { mentorRouter } from './routes/mentor.routes.js';
import { leaderboardRouter } from './routes/leaderboard.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { phasesRouter } from './routes/phases.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';

const CLIENT_URL = process.env['CLIENT_URL'] ?? 'http://localhost:5173';

export function createApp() {
  const app = express();

  // ─── Security & Middleware ────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(compression() as express.RequestHandler);
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // ─── Rate Limiting ────────────────────────────────────────────────────────
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.', code: 'RATE_LIMIT_EXCEEDED' },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many auth requests, please try again later.', code: 'AUTH_RATE_LIMIT_EXCEEDED' },
  });

  app.use('/api/', globalLimiter);

  // ─── Health Check ─────────────────────────────────────────────────────────
  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      success: true,
      message: 'LearnFlow API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env['NODE_ENV'] ?? 'development',
    });
  });

  // ─── API Routes ───────────────────────────────────────────────────────────
  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/skills', skillsRouter);
  app.use('/api/roadmaps', roadmapRouter);
  app.use('/api/concepts', conceptsRouter);
  app.use('/api/questions', questionsRouter);
  app.use('/api/progress', progressRouter);
  app.use('/api/mentor', mentorRouter);
  app.use('/api/leaderboard', leaderboardRouter);
  app.use('/api/notifications', notificationsRouter);
  app.use('/api/phases', phasesRouter);
  app.use('/api/users', usersRouter);

  // ─── 404 Handler ─────────────────────────────────────────────────────────
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new AppError(`Route ${req.method} ${req.path} not found`, 404, 'NOT_FOUND'));
  });

  // ─── Global Error Handler ─────────────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
