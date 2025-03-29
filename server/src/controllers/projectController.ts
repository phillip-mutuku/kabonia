import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { valuationService } from '../services/valuationService';
import { logger } from '../utils/logger';
import { constants } from '../config/constants';
import { tokenService } from '../services/tokenService';
import { Project } from '../models/Project';

export const projectController = {
  // Create a new carbon project
  createProject: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const projectData = { ...req.body, owner: userId };
      
      const project = await projectService.createProject(projectData);
      
      return res.status(201).json({
        success: true,
        data: project
      });
    } catch (error) {
      logger.error(`Error creating project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  
  // Get all projects (with optional filtering)
  getProjects: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, status, location, owner, projectType } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        status: status as string,
        location: location as string,
        owner: owner as string,
        projectType: projectType as string
      };
      
      const projects = await projectService.getProjects(options);
      
      return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      logger.error(`Error getting projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get a single project by ID
  getProjectById: async (req: Request, res: Response) => {
    try {
      const project = await projectService.getProjectById(req.params.id);
      
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
      logger.error(`Error getting project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
// Update a project
updateProject: async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }
    
    // Check if user is an admin
    const isAdmin = userRole === 'admin';
    
    // Get the project before update to check current status
    const existingProject = await projectService.getProjectById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    // Update the project, passing isAdmin flag
    const project = await projectService.updateProject(
      req.params.id, 
      req.body, 
      userId, 
      isAdmin
    );
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Check if status was updated to ACTIVE and there's no token yet
    let tokenization = null;
    if (req.body.status === constants.PROJECT_STATUS.ACTIVE && 
        !project.tokenId &&
        existingProject.status !== constants.PROJECT_STATUS.ACTIVE) {
      try {
        tokenization = await tokenService.tokenizeVerifiedProject(
          project._id.toString(),
          userId,
          {
            notes: `Tokenized when activated by ${isAdmin ? 'admin' : 'user'}`
          }
        );
        logger.info(`Project ${project._id} automatically tokenized upon activation`);
      } catch (tokenError) {
        logger.error(`Failed to tokenize project automatically: ${tokenError}`);
        // Continue and return success anyway, just log the error
      }
    }
    
    return res.status(200).json({
      success: true,
      data: {
        project,
        tokenization
      }
    });
  } catch (error) {
    logger.error(`Error updating project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
},
  
  // Delete a project
  deleteProject: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const success = await projectService.deleteProject(req.params.id, userId);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Project not found or unauthorized'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      logger.error(`Error deleting project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Submit a project for verification
  submitForVerification: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const project = await projectService.submitForVerification(req.params.id, userId);
      
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
      logger.error(`Error submitting project for verification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Get AI-powered credit valuation for a project
  getProjectValuation: async (req: Request, res: Response) => {
    try {
      const projectId = req.params.id;
      
      // Get project data
      const project = await projectService.getProjectById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }
      
      // Get AI prediction
      const prediction = await valuationService.getAIPrediction(project);
      
      return res.status(200).json({
        success: true,
        data: {
          project: {
            id: project._id,
            name: project.name,
            location: project.location,
            estimatedCarbonCapture: project.estimatedCarbonCapture,
            actualCarbonCapture: project.actualCarbonCapture
          },
          valuation: prediction
        }
      });
    } catch (error) {
      logger.error(`Error getting project valuation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get projects near a location
  getNearbyProjects: async (req: Request, res: Response) => {
    try {
      const { longitude, latitude, maxDistance } = req.query;
      
      if (!longitude || !latitude) {
        return res.status(400).json({
          success: false,
          error: 'Longitude and latitude are required'
        });
      }
      
      const coordinates: [number, number] = [
        parseFloat(longitude as string),
        parseFloat(latitude as string)
      ];
      
      const distance = maxDistance ? parseInt(maxDistance as string, 10) : 10000; // Default 10km
      
      const projects = await projectService.getNearbyProjects(coordinates, distance);
      
      return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      logger.error(`Error getting nearby projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get projects by owner
  getMyProjects: async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      const options = {
        page: parseInt(req.query.page as string || '1', 10),
        limit: parseInt(req.query.limit as string || '10', 10),
        owner: userId,
        status: req.query.status as string
      };
      
      const projects = await projectService.getProjects(options);
      
      return res.status(200).json({
        success: true,
        count: projects.length,
        data: projects
      });
    } catch (error) {
      logger.error(`Error getting user projects: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Upload project documents/images
  uploadProjectDocuments: async (req: Request, res: Response) => {
    try {
      // In a real implementation, this would handle file uploads
      // For this MVP, we'll simulate document URLs
      const { projectId } = req.params;
      const documentUrls = req.body.documentUrls || [];
      
      if (!Array.isArray(documentUrls) || documentUrls.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Document URLs are required'
        });
      }
      
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }
      
      // Update project documents
      const project = await projectService.updateProject(
        projectId,
        { $push: { documents: { $each: documentUrls } } },
        userId
      );
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found or unauthorized'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: project
      });
    } catch (error) {
      logger.error(`Error uploading project documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },


  // For testing only - remove in production
updateProjectStatusForTesting: async (req: Request, res: Response) => {
  try {
    const { id, status } = req.params;
    
    // Validate that the status is valid
    if (!Object.values(constants.PROJECT_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }
    
    // Update the project status
    const project = await Project.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
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
    logger.error(`Error updating project status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
}
};