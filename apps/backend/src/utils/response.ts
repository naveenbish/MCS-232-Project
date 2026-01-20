import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../types';

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  message: string,
  error?: string,
  statusCode: number = 500
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  return res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginatedResponse = <T>(
  res: Response,
  message: string,
  data: T[],
  page: number,
  limit: number,
  total: number,
  statusCode: number = 200
): Response => {
  const totalPages = Math.ceil(total / limit);

  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };

  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T>(
  res: Response,
  message: string,
  data?: T
): Response => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

/**
 * Send bad request response (400)
 */
export const sendBadRequest = (
  res: Response,
  message: string,
  error?: string
): Response => {
  return sendError(res, message, error, 400);
};

/**
 * Send unauthorized response (401)
 */
export const sendUnauthorized = (
  res: Response,
  message: string = 'Unauthorized',
  error?: string
): Response => {
  return sendError(res, message, error, 401);
};

/**
 * Send forbidden response (403)
 */
export const sendForbidden = (
  res: Response,
  message: string = 'Forbidden',
  error?: string
): Response => {
  return sendError(res, message, error, 403);
};

/**
 * Send not found response (404)
 */
export const sendNotFound = (
  res: Response,
  message: string = 'Resource not found',
  error?: string
): Response => {
  return sendError(res, message, error, 404);
};

/**
 * Send conflict response (409)
 */
export const sendConflict = (
  res: Response,
  message: string,
  error?: string
): Response => {
  return sendError(res, message, error, 409);
};

/**
 * Send internal server error response (500)
 */
export const sendInternalError = (
  res: Response,
  message: string = 'Internal server error',
  error?: string
): Response => {
  return sendError(res, message, error, 500);
};

export default {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
  sendCreated,
  sendNoContent,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendInternalError,
};
