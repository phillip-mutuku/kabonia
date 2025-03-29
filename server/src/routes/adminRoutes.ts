import { Router } from 'express';
import adminController from '../controllers/adminController';
import { auth } from '../middleware/auth';
import { roleCheck } from '../middleware/roleCheck';

const router = Router();

// Get all projects (admin only)
router.get('/projects', 
  auth, 
  roleCheck('admin'), 
  adminController.getProjects
);

// Get pending verification projects (admin only)
router.get('/projects/pending-verification', 
  auth, 
  roleCheck('admin'), 
  adminController.getPendingVerificationProjects
);

// Get project details (admin only)
router.get('/projects/:projectId', 
  auth, 
  roleCheck('admin'), 
  adminController.getProjectDetails
);

// Verify a project (admin only)
router.put('/projects/:projectId/verify', 
  auth, 
  roleCheck('admin'), 
  adminController.verifyProject
);

// Reject a project (admin only)
router.put('/projects/:projectId/reject', 
  auth, 
  roleCheck('admin'), 
  adminController.rejectProject
);

// Get project statistics (admin only)
router.get('/statistics', 
  auth, 
  roleCheck('admin'), 
  adminController.getProjectStatistics
);

export default router;