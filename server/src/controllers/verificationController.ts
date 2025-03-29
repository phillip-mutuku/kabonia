import { Request, Response } from 'express';
import { verificationService } from '../services/verificationService';
import { tokenService } from '../services/tokenService';
import { logger } from '../utils/logger';
import { constants } from '../config/constants';

export const verificationController = {

  //update the verification status
  updateVerificationStatus: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      const userId = req.user?.id?.toString();
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
  
      const { verificationId } = req.params;
      const { status, notes, carbonCaptureVerified } = req.body;
      
      const verification = await verificationService.updateVerificationStatus({
        verificationId,
        reviewerId: userId,
        status,
        notes,
        carbonCaptureVerified
      });
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          error: 'Verification not found or unauthorized'
        });
      }
  
      // Tokenize project if status is approved
      let tokenization = null;
      if (status === constants.VERIFICATION_STATUS.APPROVED) {
        try {
          // Convert ObjectId to string if needed
          const projectIdString = verification.projectId.toString();
          
          tokenization = await tokenService.tokenizeVerifiedProject(
            projectIdString, 
            userId,
            { 
              carbonCredits: carbonCaptureVerified,
              notes 
            }
          );
        } catch (tokenizationError) {
          logger.error(`Tokenization failed: ${tokenizationError}`);
        }
      }
      
      return res.status(200).json({
        success: true,
        data: {
          verification,
          tokenization
        }
      });
    } catch (error) {
      logger.error(`Error updating verification status: ${error}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Get my requested verifications
  getMyRequestedVerifications: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const options = {
        requesterId: req.user.id,
        page: parseInt(req.query.page as string || '1', 10),
        limit: parseInt(req.query.limit as string || '10', 10),
        status: req.query.status as string
      };
      
      const verifications = await verificationService.getVerifications(options);
      
      return res.status(200).json({
        success: true,
        count: verifications.length,
        data: verifications
      });
    } catch (error) {
      logger.error(`Error getting requested verifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get pending verifications (for verifiers)
  getPendingVerifications: async (req: Request, res: Response) => {
    try {
      const options = {
        status: 'pending',
        page: parseInt(req.query.page as string || '1', 10),
        limit: parseInt(req.query.limit as string || '10', 10)
      };
      
      const verifications = await verificationService.getVerifications(options);
      
      return res.status(200).json({
        success: true,
        count: verifications.length,
        data: verifications
      });
    } catch (error) {
      logger.error(`Error getting pending verifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get verifications by project
  getProjectVerifications: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      const options = {
        projectId,
        page: parseInt(req.query.page as string || '1', 10),
        limit: parseInt(req.query.limit as string || '10', 10)
      };
      
      const verifications = await verificationService.getVerifications(options);
      
      return res.status(200).json({
        success: true,
        count: verifications.length,
        data: verifications
      });
    } catch (error) {
      logger.error(`Error getting project verifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  // Start the verification process for a project
  startVerification: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const { projectId, verificationType } = req.body;
      
      const verification = await verificationService.startVerification({
        projectId,
        requesterId: userId,
        verificationType
      });
      
      return res.status(201).json({
        success: true,
        data: verification
      });
    } catch (error) {
      logger.error(`Error starting verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Submit verification data
  submitVerificationData: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const { verificationId } = req.params;
      const { data, evidence } = req.body;
      
      const verification = await verificationService.submitVerificationData({
        verificationId,
        userId,
        data,
        evidence
      });
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          error: 'Verification not found or unauthorized'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: verification
      });
    } catch (error) {
      logger.error(`Error submitting verification data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Get verification status
  getVerificationStatus: async (req: Request, res: Response) => {
    try {
      const { verificationId } = req.params;
      
      const verification = await verificationService.getVerificationById(verificationId);
      
      if (!verification) {
        return res.status(404).json({
          success: false,
          error: 'Verification not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: verification
      });
    } catch (error) {
      logger.error(`Error getting verification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get all verifications
  getVerifications: async (req: Request, res: Response) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        projectId, 
        status, 
        requesterId, 
        reviewerId 
      } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        projectId: projectId as string,
        status: status as string,
        requesterId: requesterId as string,
        reviewerId: reviewerId as string
      };
      
      const verifications = await verificationService.getVerifications(options);
      
      return res.status(200).json({
        success: true,
        count: verifications.length,
        data: verifications
      });
    } catch (error) {
      logger.error(`Error getting verifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
};

export default verificationController;