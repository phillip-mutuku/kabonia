import { Router } from 'express';
import projectRoutes from './projectRoutes';
import tokenRoutes from './tokenRoutes';
import marketRoutes from './marketRoutes';
import userRoutes from './userRoutes';
import verificationRoutes from './verificationRoutes';
import valuationRoutes from './valuationRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// Mount routes
router.use('/projects', projectRoutes);
router.use('/tokens', tokenRoutes);
router.use('/market', marketRoutes);
router.use('/users', userRoutes);
router.use('/verification', verificationRoutes);
router.use('/valuation', valuationRoutes);
router.use('/admin', adminRoutes);

export default router;