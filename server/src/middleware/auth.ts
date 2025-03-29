import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { User } from '../models/User';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        [key: string]: any;
      };
    }
  }
}

/**
 * Authentication middleware to verify the JWT token
 */
export const auth = async (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token, authorization denied'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { user: { id: string } };
    
    // Get the full user including role from database
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Add complete user info (including role) to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      email: user.email,
      name: user.name
    };
    
    next();
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Auth middleware error: ${error.message}`);
    }
    res.status(401).json({
      success: false,
      error: 'Token is not valid'
    });
  }
};