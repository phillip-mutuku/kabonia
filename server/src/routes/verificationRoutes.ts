import { Router } from 'express';
import { verificationController } from '../controllers/verificationController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { 
  verificationStartValidation, 
  verificationSubmitValidation,
  verificationStatusValidation
} from '../utils/validators';

const router = Router();

// Start verification process
router.post('/', auth, validate(verificationStartValidation), verificationController.startVerification);

// Get all verifications
router.get('/', auth, verificationController.getVerifications);

// Get my requested verifications
router.get('/me', auth, verificationController.getMyRequestedVerifications);

// Get pending verifications (for verifiers)
router.get('/pending', auth, verificationController.getPendingVerifications);

// Get project verifications
router.get('/project/:projectId', auth, verificationController.getProjectVerifications);

// Get verification status
router.get('/:verificationId', auth, verificationController.getVerificationStatus);

// Submit verification data
router.post(
  '/:verificationId/submit',
  auth,
  validate(verificationSubmitValidation),
  verificationController.submitVerificationData
);

// Update verification status
router.put(
  '/:verificationId/status',
  auth,
  validate(verificationStatusValidation),
  verificationController.updateVerificationStatus
);

export default router;