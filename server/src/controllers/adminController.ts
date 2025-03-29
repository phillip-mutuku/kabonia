import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { tokenService } from '../services/tokenService';
import { valuationService } from '../services/valuationService';
import { logger } from '../utils/logger';
import { constants } from '../config/constants';
import { Project } from '../models/Project';

export const adminController = {
  /**
   * Verify a project
   */
  verifyProject: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { carbonCredits, notes } = req.body;

      // Ensure user is authenticated and is an admin
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      // Perform AI-assisted verification
      const aiAnalysis = await valuationService.getAIPrediction({
        projectId
      });

      // Validate AI recommendations
      const isAIConfident = aiAnalysis.confidence > 0.75;
      const recommendedCarbonCredits = aiAnalysis.carbonCredits;

      // Use AI recommendation if confident, otherwise use admin input
      const finalCarbonCredits = isAIConfident 
        ? recommendedCarbonCredits 
        : carbonCredits;

      // Update project status
      const updatedProject = await projectService.updateProjectStatus(
        projectId, 
        constants.PROJECT_STATUS.VERIFIED,
        notes,
        userId
      );

      // Trigger tokenization
      const tokenization = await tokenService.tokenizeVerifiedProject(
        projectId, 
        userId,
        {
          carbonCredits: finalCarbonCredits,
          notes,
          verificationMethod: isAIConfident ? 'AI-Assisted' : 'Manual',
          aiAnalysis
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          project: updatedProject,
          tokenization,
          verificationMethod: isAIConfident ? 'AI-Assisted' : 'Manual'
        }
      });
    } catch (error) {
      logger.error(`Error verifying project: ${error}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify project'
      });
    }
  },

  /**
   * Reject a project
   */
  rejectProject: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const { notes } = req.body;

      // Ensure user is authenticated and is an admin
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const updatedProject = await projectService.updateProjectStatus(
        projectId, 
        constants.PROJECT_STATUS.VERIFIED,
        notes,
        userId
      );

      return res.status(200).json({
        success: true,
        data: updatedProject
      });
    } catch (error) {
      logger.error(`Error rejecting project: ${error}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to reject project'
      });
    }
  },

  /**
   * Get all projects
   */
  getProjects: async (req: Request, res: Response) => {
    try {
      // Get all projects logic here
      const projects = await Project.find();
      return res.status(200).json({
        success: true,
        data: projects
      });
    } catch (error) {
      logger.error(`Error fetching projects: ${error}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch projects'
      });
    }
  },
  
  /**
   * Get pending verification projects
   */
  getPendingVerificationProjects: async (req: Request, res: Response) => {
    try {
      // Get pending projects logic
      const pendingProjects = await Project.find({ 
        status: constants.PROJECT_STATUS.PENDING_VERIFICATION 
      });
      return res.status(200).json({
        success: true,
        data: pendingProjects
      });
    } catch (error) {
      logger.error(`Error fetching pending projects: ${error}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch pending projects'
      });
    }
  },
  
  /**
   * Get project details by ID
   */
  getProjectDetails: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      logger.error(`Error fetching project details: ${error}`);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch project details'
      });
    }
  },

  /**
   * Get project statistics
   */
  getProjectStatistics: async (req: Request, res: Response) => {
    try {
      const statistics = {
        totalProjects: await Project.countDocuments(),
        pendingVerification: await Project.countDocuments({ 
          status: constants.PROJECT_STATUS.PENDING_VERIFICATION 
        }),
        activeProjects: await Project.countDocuments({ 
          status: constants.PROJECT_STATUS.ACTIVE 
        }),
        completedProjects: await Project.countDocuments({ 
          status: constants.PROJECT_STATUS.COMPLETED 
        }),
        projectsByType: await Project.aggregate([
          { $group: { 
            _id: '$projectType', 
            count: { $sum: 1 } 
          }}
        ])
      };

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      logger.error(`Error fetching project statistics: ${error}`);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch project statistics'
      });
    }
  }
};

export default adminController;