import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Server Error';
  
  // If it's our custom error with status code
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }
  
  logger.error(`Error: ${message}`);
  if (err.stack) {
    logger.error(`Stack: ${err.stack}`);
  }
  
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

/**
 * Middleware for handling 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};