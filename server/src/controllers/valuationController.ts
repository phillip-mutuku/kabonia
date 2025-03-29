import { Request, Response } from 'express';
import { valuationService } from '../services/valuationService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

export const valuationController = {
  /**
   * Calculate credit value based on project data
   */
  calculateCreditValue: async (req: Request, res: Response) => {
    try {
      const projectData = req.body;
      const creditValue = await valuationService.calculateCreditValue(projectData);
      res.json({ success: true, data: creditValue });
    } catch (error) {
      logger.error(`Error calculating credit value: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to calculate credit value' });
    }
  },

  /**
   * Get AI prediction for project data
   */
  getAIPrediction: async (req: Request, res: Response) => {
    try {
      const projectData = req.body;
      const prediction = await valuationService.getAIPrediction(projectData);
      res.json({ success: true, data: prediction });
    } catch (error) {
      logger.error(`Error getting AI prediction: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to get AI prediction' });
    }
  },

  /**
   * Get market price history
   */
  getMarketPriceHistory: async (req: Request, res: Response) => {
    try {
      const { tokenId, days } = req.query;
      const history = await valuationService.getMarketPriceHistory(
        tokenId as string | undefined, 
        days ? parseInt(days as string) : 30
      );
      res.json({ success: true, data: history });
    } catch (error) {
      logger.error(`Error getting market price history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to get market price history' });
    }
  },

  /**
   * Get price recommendation for a token
   */
  getPriceRecommendation: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const recommendation = await valuationService.getPriceRecommendation(projectId);
      res.json({ success: true, data: recommendation });
    } catch (error) {
      logger.error(`Error getting price recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to get price recommendation' });
    }
  },

  /**
   * Get current market price
   */
  getCurrentMarketPrice: async (req: Request, res: Response) => {
    try {
      // Get market history for the last 7 days
      const history = await valuationService.getMarketPriceHistory(undefined, 7);
      
      // Calculate average price from the most recent data
      const latestPrices = history.slice(-3); // Last 3 data points
      const averagePrice = latestPrices.reduce((sum, item) => sum + item.price, 0) / latestPrices.length;
      
      res.json({ success: true, data: averagePrice });
    } catch (error) {
      logger.error(`Error getting current market price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to get current market price' });
    }
  },

  /**
   * Get market trend data
   */
  getMarketTrend: async (req: Request, res: Response) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      
      // Get price history
      const history = await valuationService.getMarketPriceHistory(undefined, days);
      
      if (history.length < 2) {
        throw new AppError('Not enough data to calculate trend', 400);
      }
      
      // Calculate trend
      const oldestPrice = history[0].price;
      const latestPrice = history[history.length - 1].price;
      const changePercent = ((latestPrice - oldestPrice) / oldestPrice) * 100;
      
      // Determine trend direction
      let trend: 'rising' | 'falling' | 'stable' = 'stable';
      if (changePercent > 2) trend = 'rising';
      else if (changePercent < -2) trend = 'falling';
      
      // Calculate average price
      const averagePrice = history.reduce((sum, item) => sum + item.price, 0) / history.length;
      
      // Calculate volatility (coefficient of variation)
      const prices = history.map(item => item.price);
      const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const squaredDiffs = prices.map(price => Math.pow(price - mean, 2));
      const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / prices.length;
      const volatility = Math.sqrt(variance) / mean;
      
      res.json({
        success: true,
        data: {
          trend,
          changePercent,
          averagePrice,
          volatility: volatility * 100 // Convert to percentage
        }
      });
    } catch (error) {
      logger.error(`Error getting market trend: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to get market trend' });
    }
  },

  /**
   * Get performance comparison for different project types
   */
  getProjectTypePerformance: async (req: Request, res: Response) => {
    try {
      const projectTypes = ['reforestation', 'conservation', 'renewable_energy', 'methane_capture', 'soil_carbon'];
      
      // Create simulated performance data based on project types
      const projectTypesData: Record<string, any> = {};
      
      for (const type of projectTypes) {
        // Simulate project data for prediction
        const mockProject = {
          projectType: type,
          area: 500,
          location: type === 'reforestation' ? 'Amazon Rainforest' : 'Global',
          estimatedCarbonCapture: 5000,
          startDate: new Date('2023-01-01'),
          endDate: new Date('2043-01-01')
        };
        
        // Get AI prediction for this project type
        const prediction = await valuationService.getAIPrediction(mockProject);
        
        // Create performance data
        projectTypesData[type] = {
          averagePrice: prediction.creditValue,
          trend: prediction.marketTrend,
          changePercent: prediction.marketTrend === 'rising' ? 
            Math.random() * 5 + 2 : // 2-7% increase
            prediction.marketTrend === 'falling' ? 
              -(Math.random() * 5 + 2) : // 2-7% decrease
              Math.random() * 2 - 1 // -1% to 1% (stable)
        };
      }
      
      res.json({ success: true, data: projectTypesData });
    } catch (error) {
      logger.error(`Error getting project type performance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to get project type performance' });
    }
  },

  /**
   * Calculate ROI projection
   */
  calculateROIProjection: async (req: Request, res: Response) => {
    try {
      const { initialInvestment, projectType, holdingPeriod, riskTolerance } = req.body;
      
      // Validate inputs
      if (!initialInvestment || initialInvestment <= 0) {
        throw new AppError('Initial investment must be greater than 0', 400);
      }
      
      if (!projectType) {
        throw new AppError('Project type is required', 400);
      }
      
      if (!holdingPeriod || holdingPeriod <= 0) {
        throw new AppError('Holding period must be greater than 0', 400);
      }
      
      // Get current market data
      const marketHistory = await valuationService.getMarketPriceHistory(undefined, 90);
      const latestPrice = marketHistory[marketHistory.length - 1].price;
      
      // Get project-specific prediction
      const mockProject = {
        projectType,
        area: 500,
        location: projectType === 'reforestation' ? 'Amazon Rainforest' : 'Global',
        estimatedCarbonCapture: 5000,
        startDate: new Date(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 20))
      };
      
      const prediction = await valuationService.getAIPrediction(mockProject);
      
      // Calculate estimated number of credits purchased
      const creditsPerInvestment = initialInvestment / latestPrice;
      
      // Calculate risk factors
      const riskFactors = {
        low: { volatilityMultiplier: 0.7, upside: 0.05, downside: 0.02 },
        medium: { volatilityMultiplier: 1.0, upside: 0.12, downside: 0.06 },
        high: { volatilityMultiplier: 1.5, upside: 0.25, downside: 0.15 }
      };
      
      const risk = riskFactors[riskTolerance as keyof typeof riskFactors] || riskFactors.medium;
      
      // Calculate monthly growth rate based on prediction and risk
      const monthlyGrowthRate = prediction.marketTrend === 'rising' 
        ? (risk.upside / 12) 
        : prediction.marketTrend === 'falling'
          ? -(risk.downside / 12)
          : 0.002; // slight growth for stable market
      
      // Calculate projected value after holding period
      const projectedValue = initialInvestment * 
        Math.pow(1 + monthlyGrowthRate, holdingPeriod);
      
      // Calculate return metrics
      const absoluteReturn = projectedValue - initialInvestment;
      const percentageReturn = (absoluteReturn / initialInvestment) * 100;
      const annualizedReturn = (Math.pow(1 + percentageReturn / 100, 12 / holdingPeriod) - 1) * 100;
      
      // Generate scenarios
      const scenarios = {
        conservative: initialInvestment * Math.pow(1 + monthlyGrowthRate * 0.5, holdingPeriod),
        expected: projectedValue,
        optimistic: initialInvestment * Math.pow(1 + monthlyGrowthRate * 1.5, holdingPeriod)
      };
      
      res.json({
        success: true,
        data: {
          projectedValue: Math.round(projectedValue * 100) / 100,
          absoluteReturn: Math.round(absoluteReturn * 100) / 100,
          percentageReturn: Math.round(percentageReturn * 100) / 100,
          annualizedReturn: Math.round(annualizedReturn * 100) / 100,
          creditsEstimate: Math.round(creditsPerInvestment * 100) / 100,
          scenarios: {
            conservative: Math.round(scenarios.conservative * 100) / 100,
            expected: Math.round(scenarios.expected * 100) / 100,
            optimistic: Math.round(scenarios.optimistic * 100) / 100
          },
          marketTrend: prediction.marketTrend,
          confidence: prediction.confidence * 100
        }
      });
    } catch (error) {
      logger.error(`Error calculating ROI projection: ${error instanceof Error ? error.message : 'Unknown error'}`);
      res.status(500).json({ success: false, error: 'Failed to calculate ROI projection' });
    }
  }
};