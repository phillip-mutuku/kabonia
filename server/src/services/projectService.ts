import { Project, IProject } from '../models/Project';
import { hederaService } from './hederaService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { constants } from '../config/constants';
import { tokenService } from './tokenService';
import mongoose from 'mongoose';

export const projectService = {
  /**
   * Create a new carbon project
   * @param projectData - Project data
   * @returns Newly created project
   */
  createProject: async (projectData: any): Promise<IProject> => {
    try {
      // Initialize the project on Hedera
      const topicId = await hederaService.initializeProject(projectData.name);
      
      // Create project in database with topicId
      const project = new Project({
        ...projectData,
        topicId,
        status: constants.PROJECT_STATUS.DRAFT
      });
      
      await project.save();
      
      logger.info(`Created project ${project._id} with topic ID ${topicId}`);
      
      return project;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error creating project: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get all projects with optional filtering
   * @param options - Filter options
   * @returns Array of projects
   */
  getProjects: async (options: {
    page?: number;
    limit?: number;
    status?: string;
    location?: string;
    owner?: string;
    projectType?: string;
  }): Promise<IProject[]> => {
    try {
      const { 
        page = 1, 
        limit = constants.DEFAULT_PAGE_SIZE,
        status,
        location,
        owner,
        projectType
      } = options;
      
      // Build query
      const query: any = {};
      
      if (status) {
        query.status = status;
      }
      
      if (location) {
        query.location = { $regex: location, $options: 'i' };
      }
      
      if (owner) {
        query.owner = owner;
      }
      
      if (projectType) {
        query.projectType = projectType;
      }
      
      // Execute query with pagination
      const projects = await Project.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('owner', 'name email');
      
      return projects;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting projects: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get a project by ID
   * @param projectId - Project ID
   * @returns Project or null if not found
   */
  getProjectById: async (projectId: string): Promise<IProject | null> => {
    try {
      const project = await Project.findById(projectId)
        .populate('owner', 'name email')
        .populate('verificationHistory.verifier', 'name email');
      
      return project;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting project by ID: ${error.message}`);
      }
      throw error;
    }
  },
  
/**
 * Update a project
 * @param projectId - Project ID
 * @param updateData - Data to update
 * @param userId - User ID making the update (for ownership check)
 * @param isAdmin - Flag indicating if the user is an admin
 * @returns Updated project or null if not found/unauthorized
 */
updateProject: async (
  projectId: string,
  updateData: any,
  userId: string,
  isAdmin: boolean = false
): Promise<IProject | null> => {
  try {
    // Find project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return null;
    }
    
    // Skip ownership check for admins
    if (!isAdmin && project.owner.toString() !== userId) {
      throw new AppError('Not authorized to update this project', 403);
    }
    
    // Don't allow status changes through this method if not admin
    if (!isAdmin && updateData.status) {
      delete updateData.status;
    }
    
    // Update project
    Object.assign(project, updateData);
    await project.save();
    
    logger.info(`Updated project ${projectId} by ${isAdmin ? 'admin' : 'owner'}`);
    
    return project;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error updating project: ${error.message}`);
    }
    throw error;
  }
},
  
  /**
   * Delete a project
   * @param projectId - Project ID
   * @param userId - User ID making the request (for ownership check)
   * @returns Success flag
   */
  deleteProject: async (projectId: string, userId: string): Promise<boolean> => {
    try {
      // Find project and check ownership
      const project = await Project.findById(projectId);
      
      if (!project) {
        return false;
      }
      
      // Check if user is the owner
      if (project.owner.toString() !== userId) {
        throw new AppError('Not authorized to delete this project', 403);
      }
      
      // Don't allow deletion of verified or active projects
      if (
        project.status === constants.PROJECT_STATUS.VERIFIED ||
        project.status === constants.PROJECT_STATUS.ACTIVE
      ) {
        throw new AppError('Cannot delete verified or active projects', 400);
      }
      
      // Delete project
      await Project.findByIdAndDelete(projectId);
      
      logger.info(`Deleted project ${projectId}`);
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error deleting project: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Update project status
   * @param projectId - Project ID
   * @param status - New status
   * @param notes - Optional notes
   * @param verifierId - User ID of verifier (for verification status)
   * @returns Updated project
   */
// In projectService.ts
updateProjectStatus: async (
  projectId: string,
  status: string,
  notes?: string,
  verifierId?: string,
  isAdmin: boolean = false
): Promise<IProject | null> => {
  try {
    const project = await Project.findById(projectId);
    
    if (!project) {
      return null;
    }
    
    // Update status
    project.status = status;
    
    // Add to verification history if it's a verification-related status
    if (verifierId && [
      constants.PROJECT_STATUS.PENDING_VERIFICATION,
      constants.PROJECT_STATUS.VERIFIED,
      constants.PROJECT_STATUS.ACTIVE
    ].includes(status)) {
      project.verificationHistory.push({
        date: new Date(),
        status,
        notes,
        verifier: new mongoose.Types.ObjectId(verifierId)
      });
    }
    
    await project.save();
    
    logger.info(`Updated project ${projectId} status to ${status}`);
    
    // Automatically tokenize the project if status is changed to active and project doesn't have a token yet
    if (status === constants.PROJECT_STATUS.ACTIVE && !project.tokenId && verifierId) {
      try {
        // Import tokenService at the top of the file if not already imported
        const tokenization = await tokenService.tokenizeVerifiedProject(
          projectId,
          verifierId,
          {
            notes: notes || `Tokenized when activated via status update`
          }
        );
        logger.info(`Project ${projectId} automatically tokenized upon activation`);
        
        // The project is already updated with tokenId in tokenizeVerifiedProject
        return tokenization.project;
      } catch (tokenError) {
        logger.error(`Failed to tokenize project automatically: ${tokenError}`);
        // Continue and return the project anyway
      }
    }
    
    return project;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error updating project status: ${error.message}`);
    }
    throw error;
  }
},
  
  /**
   * Submit a project for verification
   * @param projectId - Project ID
   * @param userId - User ID making the request (for ownership check)
   * @returns Updated project
   */
  submitForVerification: async (
    projectId: string,
    userId: string
  ): Promise<IProject | null> => {
    try {
      // Find project and check ownership
      const project = await Project.findById(projectId);
      
      if (!project) {
        return null;
      }
      
      // Check if user is the owner
      if (project.owner.toString() !== userId) {
        throw new AppError('Not authorized to submit this project for verification', 403);
      }
      
      // Ensure project is in draft status
      if (project.status !== constants.PROJECT_STATUS.DRAFT) {
        throw new AppError(`Project must be in draft status to submit for verification, current status: ${project.status}`, 400);
      }
      
      // Update status to pending verification
      project.status = constants.PROJECT_STATUS.PENDING_VERIFICATION;
      
      // Add to verification history
      project.verificationHistory.push({
        date: new Date(),
        status: constants.VERIFICATION_STATUS.PENDING,
        notes: 'Project submitted for verification'
      });
      
      await project.save();
      
      logger.info(`Submitted project ${projectId} for verification`);
      
      return project;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error submitting project for verification: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get nearby projects based on coordinates
   * @param coordinates - [longitude, latitude]
   * @param maxDistance - Maximum distance in meters
   * @returns Array of nearby projects
   */
  getNearbyProjects: async (
    coordinates: [number, number],
    maxDistance: number = 10000 // Default 10km
  ): Promise<IProject[]> => {
    try {
      const projects = await Project.find({
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates
            },
            $maxDistance: maxDistance
          }
        }
      }).populate('owner', 'name email');
      
      return projects;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting nearby projects: ${error.message}`);
      }
      throw error;
    }
  }
};