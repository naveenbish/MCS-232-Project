import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../types';
import logger from '../config/logger';
import { sendError, sendInternalError } from '../utils/response';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  // Log error
  logger.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Handle AppError (custom operational errors)
  if (err instanceof AppError) {
    return sendError(res, err.message, err.message, err.statusCode);
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return sendError(res, 'Invalid data provided', err.message, 400);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 'Authentication failed', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 'Please login again', 401);
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return sendError(res, 'Validation error', err.message, 400);
  }

  // Handle multer errors (file upload)
  if (err.name === 'MulterError') {
    return sendError(res, 'File upload error', err.message, 400);
  }

  // Default to 500 server error
  return sendInternalError(
    res,
    'An unexpected error occurred',
    process.env.NODE_ENV === 'development' ? err.message : undefined
  );
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (
  err: Prisma.PrismaClientKnownRequestError,
  res: Response
): Response => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const target = err.meta?.target as string[] | undefined;
      const field = target ? target[0] : 'field';
      return sendError(res, `${field} already exists`, 'Duplicate entry', 409);

    case 'P2025':
      // Record not found
      return sendError(res, 'Record not found', 'Resource does not exist', 404);

    case 'P2003':
      // Foreign key constraint violation
      return sendError(
        res,
        'Related record not found',
        'Invalid reference',
        400
      );

    case 'P2014':
      // Required relation violation
      return sendError(
        res,
        'Invalid relation',
        'Cannot perform operation due to required relation',
        400
      );

    case 'P2000':
      // Value too long for column
      return sendError(res, 'Value too long', 'Input data exceeds maximum length', 400);

    case 'P2001':
      // Record does not exist
      return sendError(res, 'Record not found', 'Resource does not exist', 404);

    default:
      logger.error('Unhandled Prisma error:', err);
      return sendInternalError(
        res,
        'Database error occurred',
        process.env.NODE_ENV === 'development' ? err.message : undefined
      );
  }
};

/**
 * Handle 404 - Route not found
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): Response => {
  return sendError(
    res,
    `Route ${req.originalUrl} not found`,
    'Endpoint does not exist',
    404
  );
};

/**
 * Async error wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
