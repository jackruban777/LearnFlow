import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError, PrismaClientInitializationError, PrismaClientValidationError } from '@prisma/client/runtime/library.js';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[Error] ${req.method} ${req.path} - ${err.stack || err.message}`);

  // ─── Zod Validation Errors ────────────────────────────────────────────────
  if (err instanceof ZodError) {
    const message = err.errors
      .map((e) => `${e.path.join('.') || 'body'}: ${e.message}`)
      .join(', ');
    return res.status(400).json({
      success: false,
      data: null,
      message: `Validation failed: ${message}`,
      code: 'VALIDATION_ERROR',
    });
  }

  // ─── Prisma Database Errors ───────────────────────────────────────────────
  if (err instanceof PrismaClientKnownRequestError) {
    const prismaErr = err as any;
    if (prismaErr.code === 'P2002') {
      const fields = (prismaErr.meta?.target as string[])?.join(', ') || 'fields';
      return res.status(409).json({
        success: false,
        data: null,
        message: `Conflict: A record with this unique ${fields} already exists.`,
        code: 'DUPLICATE_RECORD',
      });
    }
    return res.status(400).json({
      success: false,
      data: null,
      message: `Database error: ${err.message}`,
      code: 'DATABASE_ERROR',
    });
  }

  if (err instanceof PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      data: null,
      message: 'Database connection failed. Service is temporarily running in mock mode or database is down.',
      code: 'DATABASE_CONNECTION_ERROR',
    });
  }

  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      data: null,
      message: 'Invalid database query parameters.',
      code: 'DATABASE_VALIDATION_ERROR',
    });
  }

  // ─── AppError (Custom Application Error) ──────────────────────────────────
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      data: null,
      message: err.message,
      code: err.errorCode,
    });
  }

  // ─── Fallback Generic Errors ──────────────────────────────────────────────
  const statusCode = (err as any).statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    data: null,
    message: err.message || 'An unexpected error occurred.',
    code: (err as any).code || 'INTERNAL_SERVER_ERROR',
  });
}
