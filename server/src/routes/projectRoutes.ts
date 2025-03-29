import { Router } from 'express';
import { projectController } from '../controllers/projectController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { projectValidation } from '../utils/validators';

const router = Router();

// For testing only - remove in production
router.put('/:id/test-status/:status', auth, projectController.updateProjectStatusForTesting);

// Create a new project
router.post('/', auth, validate(projectValidation), projectController.createProject);

// Get all projects
router.get('/', projectController.getProjects);

// Get my projects
router.get('/me', auth, projectController.getMyProjects);

// Get nearby projects
router.get('/nearby', projectController.getNearbyProjects);

// Get a single project
router.get('/:id', projectController.getProjectById);

// Update a project
router.put('/:id', auth, projectController.updateProject);

// Delete a project
router.delete('/:id', auth, projectController.deleteProject);

// Submit a project for verification
router.post('/:id/submit-verification', auth, projectController.submitForVerification);

// Get project valuation
router.get('/:id/valuation', auth, projectController.getProjectValuation);

// Upload project documents
router.post('/:projectId/documents', auth, projectController.uploadProjectDocuments);

export default router;