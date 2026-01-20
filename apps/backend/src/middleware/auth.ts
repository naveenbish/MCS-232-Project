import { Response, NextFunction } from 'express';
import { AuthRequest, AppError } from '../types';
import { verifyAccessToken } from '../utils/jwt';
import { sendUnauthorized, sendForbidden } from '../utils/response';
import logger from '../config/logger';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendUnauthorized(res, 'No token provided', 'Authentication required');
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      sendUnauthorized(res, 'Invalid token format', 'Authentication required');
      return;
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Attach user to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    logger.debug(`User authenticated: ${decoded.email} (${decoded.role})`);
    next();
  } catch (error) {
    if (error instanceof Error) {
      sendUnauthorized(res, 'Invalid or expired token', error.message);
    } else {
      sendUnauthorized(res, 'Authentication failed');
    }
  }
};

/**
 * Check if user has required role
 */
export const authorize = (...allowedRoles: Array<'user' | 'admin'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        sendUnauthorized(res, 'User not authenticated');
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(
          `Unauthorized access attempt by ${req.user.email} (${req.user.role}) to ${req.path}`
        );
        sendForbidden(
          res,
          'You do not have permission to access this resource',
          `Required role: ${allowedRoles.join(' or ')}`
        );
        return;
      }

      logger.debug(
        `User authorized: ${req.user.email} (${req.user.role}) for ${req.path}`
      );
      next();
    } catch (error) {
      if (error instanceof Error) {
        sendForbidden(res, 'Authorization failed', error.message);
      } else {
        sendForbidden(res, 'Authorization failed');
      }
    }
  };
};

/**
 * Optional authentication - attach user if token exists but don't fail if not
 */
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      if (token) {
        const decoded = verifyAccessToken(token);
        req.user = {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        };
      }
    }

    next();
  } catch (error) {
    // Continue without user if token is invalid
    logger.debug('Optional auth failed, continuing without user');
    next();
  }
};

export default {
  authenticate,
  authorize,
  optionalAuth,
};
