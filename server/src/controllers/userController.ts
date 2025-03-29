import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export const userController = {
  // Register a new user
  register: async (req: Request, res: Response) => {
    try {
      const { name, email, password, walletId } = req.body;
      
      // Check if user already exists
      let user = await User.findOne({ email });
      
      if (user) {
        return res.status(400).json({
          success: false,
          error: 'User already exists'
        });
      }
      
      // Create new user
      user = new User({
        name,
        email,
        password,
        walletId
      });
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      
      await user.save();
      
      // Create and return JWT
      const payload = {
        user: {
          id: user.id
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.status(201).json({
            success: true,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              walletId: user.walletId,
              role: user.role
            }
          });
        }
      );
    } catch (error) {
      logger.error(`Error registering user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // User login
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      // Check if user exists
      const user = await User.findOne({ email });
      
      if (!user) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Invalid credentials'
        });
      }
      
      // Create and return JWT
      const payload = {
        user: {
          id: user.id
        }
      };
      
      jwt.sign(
        payload,
        process.env.JWT_SECRET as string,
        { expiresIn: '24h' },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            success: true,
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              walletId: user.walletId,
              role: user.role
            }
          });
        }
      );
    } catch (error) {
      logger.error(`Error logging in user: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get current user profile
  getProfile: async (req: Request, res: Response) => {
    try {
      // User is already available from auth middleware
      const user = await User.findById(req.user?.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error getting user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Update user profile
  updateProfile: async (req: Request, res: Response) => {
    try {
      const { name, email, walletId } = req.body;
      
      // Build update object
      const updateFields: Record<string, any> = {};
      if (name) updateFields.name = name;
      if (email) updateFields.email = email;
      if (walletId) updateFields.walletId = walletId;
      
      // Update user
      const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $set: updateFields },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error updating user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Change password
  changePassword: async (req: Request, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Get user with password
      const user = await User.findById(req.user?.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      // Check current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          error: 'Current password is incorrect'
        });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      
      await user.save();
      
      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      logger.error(`Error changing password: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get user by ID (admin only)
  getUserById: async (req: Request, res: Response) => {
    try {
      // Check if requesting user is admin
      const requestingUser = await User.findById(req.user?.id);
      if (!requestingUser || requestingUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this resource'
        });
      }
      
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error getting user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Update user role (admin only)
  updateUserRole: async (req: Request, res: Response) => {
    try {
      const { role } = req.body;
      
      // Validate role
      if (!['user', 'admin', 'verifier'].includes(role)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid role'
        });
      }
      
      // Check if requesting user is admin
      const requestingUser = await User.findById(req.user?.id);
      if (!requestingUser || requestingUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update user roles'
        });
      }
      
      // Update user role
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error updating user role: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Connect wallet
  connectWallet: async (req: Request, res: Response) => {
    try {
      const { walletId } = req.body;
      
      if (!walletId) {
        return res.status(400).json({
          success: false,
          error: 'Wallet ID is required'
        });
      }
      
      // Update user
      const user = await User.findByIdAndUpdate(
        req.user?.id,
        { walletId },
        { new: true }
      ).select('-password');
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }
      
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error(`Error connecting wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};