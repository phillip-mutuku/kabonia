import { Router } from 'express';
import { userController } from '../controllers/userController';
import { auth } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { registerValidation, loginValidation } from '../utils/validators';

const router = Router();

// Register a new user
router.post('/register', validate(registerValidation), userController.register);

// Login user
router.post('/login', validate(loginValidation), userController.login);

// Get current user profile
router.get('/me', auth, userController.getProfile);

// Update user profile
router.put('/me', auth, userController.updateProfile);

// Change password
router.post('/change-password', auth, userController.changePassword);

// Connect wallet
router.post('/connect-wallet', auth, userController.connectWallet);

// Get user by ID (admin only)
router.get('/:id', auth, userController.getUserById);

// Update user role (admin only)
router.put('/:id/role', auth, userController.updateUserRole);

export default router;