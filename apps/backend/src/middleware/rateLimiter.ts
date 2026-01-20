import rateLimit from 'express-rate-limit';
import { config } from '../config/env';
import { sendError } from '../utils/response';

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
  max: config.RATE_LIMIT_MAX_REQUESTS, // 100 requests per windowMs by default
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many requests',
      'Rate limit exceeded. Please try again later.',
      429
    );
  },
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (_req, res) => {
    sendError(
      res,
      'Too many authentication attempts',
      'Please try again after 15 minutes',
      429
    );
  },
});

/**
 * Rate limiter for payment endpoints
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 payment requests per hour
  message: 'Too many payment requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many payment requests',
      'Please try again after some time',
      429
    );
  },
});

/**
 * Rate limiter for order creation
 */
export const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 orders per hour
  message: 'Too many orders placed, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many order requests',
      'Please try again after some time',
      429
    );
  },
});

/**
 * Rate limiter for review submissions
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 reviews per hour
  message: 'Too many reviews submitted, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(
      res,
      'Too many review submissions',
      'Please try again after some time',
      429
    );
  },
});

export default {
  apiLimiter,
  authLimiter,
  paymentLimiter,
  orderLimiter,
  reviewLimiter,
};
