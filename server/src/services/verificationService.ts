import { Verification, IVerification } from '../models/Verification';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { hederaService } from './hederaService';
import { projectService } from './projectService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { constants } from '../config/constants';
import mongoose from 'mongoose';

export const verificationService = {
  /**
   * Start a new verification process
   * @param params - Verification parameters
   * @returns The created verification record
   */
  startVerification: async (params: {
    projectId: string;
    requesterId: string;
    verificationType: string;
  }): Promise<IVerification> => {
    try {
      const { projectId, requesterId, verificationType } = params;
      
      // Find project
      const project = await Project.findById(projectId);
      if (!project) {
        throw new AppError(`Project not found: ${projectId}`, 404);
      }
      
      // Check if project owner is the requester
      if (project.owner.toString() !== requesterId) {
        throw new AppError('Only the project owner can request verification', 403);
      }
      
      // Check if project is in appropriate status
      if (![constants.PROJECT_STATUS.DRAFT, constants.PROJECT_STATUS.PENDING_VERIFICATION].includes(project.status)) {
        throw new AppError(`Project must be in draft or pending verification status, current status: ${project.status}`, 400);
      }
      
      // Check if there are any active verifications
      const activeVerification = await Verification.findOne({
        projectId,
        status: {
          $in: [
            constants.VERIFICATION_STATUS.PENDING,
            constants.VERIFICATION_STATUS.IN_PROGRESS
          ]
        }
      });
      
      if (activeVerification) {
        throw new AppError('This project already has an active verification process', 400);
      }
      
      // Create verification
      const verification = new Verification({
        projectId: new mongoose.Types.ObjectId(projectId),
        requesterId: new mongoose.Types.ObjectId(requesterId),
        verificationType,
        status: constants.VERIFICATION_STATUS.PENDING,
        startDate: new Date()
      });
      
      await verification.save();
      
      // Update project status to pending verification
      if (project.status !== constants.PROJECT_STATUS.PENDING_VERIFICATION) {
        await projectService.updateProjectStatus(
          projectId,
          constants.PROJECT_STATUS.PENDING_VERIFICATION,
          'Verification process started'
        );
      }
      
      logger.info(`Started verification process for project ${projectId}`);
      
      return verification;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error starting verification: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Submit verification data
   * @param params - Verification data submission parameters
   * @returns Updated verification record
   */
  submitVerificationData: async (params: {
    verificationId: string;
    userId: string;
    data: any;
    evidence: string[];
  }): Promise<IVerification | null> => {
    try {
      const { verificationId, userId, data, evidence } = params;
      
      // Find verification
      const verification = await Verification.findById(verificationId);
      if (!verification) {
        return null;
      }
      
      // Find user to check role
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Check if user is authorized (verifier or project owner)
      if (user.role !== 'verifier' && verification.requesterId.toString() !== userId) {
        throw new AppError('Not authorized to submit verification data', 403);
      }
      
      // Check if verification is in appropriate status
      if (![constants.VERIFICATION_STATUS.PENDING, constants.VERIFICATION_STATUS.IN_PROGRESS].includes(verification.status)) {
        throw new AppError(`Verification must be pending or in progress, current status: ${verification.status}`, 400);
      }
      
      // Update verification
      verification.data = data;
      verification.evidence = evidence;
      verification.status = constants.VERIFICATION_STATUS.IN_PROGRESS;
      
      await verification.save();
      
      logger.info(`Submitted verification data for verification ${verificationId}`);
      
      return verification;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error submitting verification data: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Update verification status
   * @param params - Status update parameters
   * @returns Updated verification record
   */
  updateVerificationStatus: async (params: {
    verificationId: string;
    reviewerId: string;
    status: string;
    notes?: string;
    carbonCaptureVerified?: number;
  }): Promise<IVerification | null> => {
    try {
      const { verificationId, reviewerId, status, notes, carbonCaptureVerified } = params;
      
      // Find verification
      const verification = await Verification.findById(verificationId);
      if (!verification) {
        return null;
      }
      
      // Find user to check role
      const user = await User.findById(reviewerId);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Check if user is authorized (must be a verifier)
      if (user.role !== 'verifier') {
        throw new AppError('Only verifiers can update verification status', 403);
      }
      
      // Ensure status is valid
      if (!Object.values(constants.VERIFICATION_STATUS).includes(status)) {
        throw new AppError(`Invalid status: ${status}`, 400);
      }
      
      // If rejecting, notes are required
      if (status === constants.VERIFICATION_STATUS.REJECTED && !notes) {
        throw new AppError('Notes are required when rejecting a verification', 400);
      }
      
      // If approving, carbon capture verified is required
      if (status === constants.VERIFICATION_STATUS.APPROVED && carbonCaptureVerified === undefined) {
        throw new AppError('Verified carbon capture amount is required when approving', 400);
      }
      
      // Update verification
      verification.status = status;
      verification.reviewerId = new mongoose.Types.ObjectId(reviewerId);
      verification.notes = notes;
      
      if (carbonCaptureVerified !== undefined) {
        verification.carbonCaptureVerified = carbonCaptureVerified;
      }
      
      if ([constants.VERIFICATION_STATUS.APPROVED, constants.VERIFICATION_STATUS.REJECTED].includes(status)) {
        verification.completionDate = new Date();
      }
      
      await verification.save();
      
      // Find project to update
      const project = await Project.findById(verification.projectId);
      if (!project) {
        throw new AppError('Project not found', 404);
      }
      
      // Update project based on verification result
      if (status === constants.VERIFICATION_STATUS.APPROVED) {
        // Update project status to verified
        await projectService.updateProjectStatus(
          project._id.toString(),
          constants.PROJECT_STATUS.VERIFIED,
          notes || 'Project successfully verified',
          reviewerId
        );
        
        // Update actual carbon capture
        if (carbonCaptureVerified !== undefined) {
          project.actualCarbonCapture = carbonCaptureVerified;
          await project.save();
        }
        
        // Record verification on the ledger
        if (project.topicId) {
          const transactionId = await hederaService.recordVerification({
            projectId: project._id.toString(),
            topicId: project.topicId,
            verificationId: verification._id.toString(),
            status,
            carbonAmount: carbonCaptureVerified || 0,
            verifierId: reviewerId
          });
          
          verification.transactionId = transactionId;
          await verification.save();
        }
      } else if (status === constants.VERIFICATION_STATUS.REJECTED) {
        // Update project status back to draft
        await projectService.updateProjectStatus(
          project._id.toString(),
          constants.PROJECT_STATUS.DRAFT,
          notes || 'Verification rejected',
          reviewerId
        );
      }
      
      logger.info(`Updated verification ${verificationId} status to ${status}`);
      
      return verification;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error updating verification status: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get verification by ID
   * @param verificationId - Verification ID
   * @returns Verification record or null if not found
   */
  getVerificationById: async (verificationId: string): Promise<IVerification | null> => {
    try {
      const verification = await Verification.findById(verificationId)
        .populate('projectId', 'name location status')
        .populate('requesterId', 'name email')
        .populate('reviewerId', 'name email');
      
      return verification;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting verification by ID: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get verifications with optional filtering
   * @param options - Filter options
   * @returns Array of verifications
   */
  getVerifications: async (options: {
    page?: number;
    limit?: number;
    projectId?: string;
    status?: string;
    requesterId?: string;
    reviewerId?: string;
  }): Promise<IVerification[]> => {
    try {
      const { 
        page = 1, 
        limit = constants.DEFAULT_PAGE_SIZE,
        projectId,
        status,
        requesterId,
        reviewerId
      } = options;
      
      // Build query
      const query: any = {};
      
      if (projectId) {
        query.projectId = projectId;
      }
      
      if (status) {
        query.status = status;
      }
      
      if (requesterId) {
        query.requesterId = requesterId;
      }
      
      if (reviewerId) {
        query.reviewerId = reviewerId;
      }
      
      // Execute query with pagination
      const verifications = await Verification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('projectId', 'name location status')
        .populate('requesterId', 'name email')
        .populate('reviewerId', 'name email');
      
      return verifications;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting verifications: ${error.message}`);
      }
      throw error;
    }
  }
};