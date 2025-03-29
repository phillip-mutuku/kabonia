import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { logger } from '../utils/logger';

/**
 * Middleware to check user role
 * @param allowedRoles Array of roles allowed to access the route
 */
export const roleCheck = (...allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user is attached (from auth middleware)
      if (!req.user || !req.user.id || !req.user.role) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
      }
      
      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.role)) {
        logger.warn(`Unauthorized access attempt by user ${req.user.id} with role ${req.user.role}`);
        return res.status(403).json({
          success: false,
          error: 'Access denied. Insufficient permissions.'
        });
      }
      
      // User has required role, proceed
      next();
    } catch (error) {
      logger.error(`Role check middleware error: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Server error during role verification'
      });
    }
  };
};