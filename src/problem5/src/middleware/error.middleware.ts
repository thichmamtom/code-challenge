import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
}

/**
 * Global error handling middleware.
 * Must have all 4 parameters to be recognized by Express as an error handler.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && config.nodeEnv === 'production'
    ? 'Internal Server Error'
    : err.message;

  console.error(`[ERROR] ${statusCode} - ${err.message}`);
  if (config.nodeEnv === 'development') {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`,
  });
}
