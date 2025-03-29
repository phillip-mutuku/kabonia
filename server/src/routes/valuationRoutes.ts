
import express from 'express';
import { valuationController } from '../controllers/valuationController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/market-history', valuationController.getMarketPriceHistory);
router.get('/market-trend', valuationController.getMarketTrend);
router.get('/current-market-price', valuationController.getCurrentMarketPrice);
router.get('/project-type-performance', valuationController.getProjectTypePerformance);

// Protected routes - require authentication
router.post('/calculate-value', auth, valuationController.calculateCreditValue);
router.post('/prediction', auth, valuationController.getAIPrediction);
router.get('/recommendation/:projectId', auth, valuationController.getPriceRecommendation);
router.post('/roi-projection', auth, valuationController.calculateROIProjection);

export default router;