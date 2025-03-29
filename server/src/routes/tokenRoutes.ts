import { Router } from 'express';
import { tokenController } from '../controllers/tokenController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { tokenValidation, transferValidation } from '../utils/validators';

const router = Router();

// Tokenize a project
router.post('/projects/:projectId/tokenize', auth, tokenController.tokenizeProject);

// Check tokenization readiness
router.get('/projects/:projectId/readiness', auth, tokenController.checkTokenizationReadiness);

// Create a new token
router.post('/', auth, validate(tokenValidation), tokenController.createToken);

// Get all tokens
router.get('/', tokenController.getTokens);

// Get my tokens
router.get('/me', auth, tokenController.getMyTokens);

// Get project tokens
router.get('/project/:projectId', tokenController.getProjectTokens);

// Get a single token
router.get('/:id', tokenController.getTokenById);

// Transfer tokens
router.post('/transfer', auth, validate(transferValidation), tokenController.transferToken);

// Mint additional tokens
router.post('/mint', auth, tokenController.mintTokens);

// Get token balance
router.get('/:tokenId/balance', auth, tokenController.getTokenBalance);

// Generate token report
router.get('/:projectId/report', auth, tokenController.generateTokenReport);

// Get token analytics
router.get('/:tokenId/analytics', auth, tokenController.getTokenAnalytics);

export default router;