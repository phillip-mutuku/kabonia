import { Request, Response } from 'express';
import { marketService } from '../services/marketService';
import { valuationService } from '../services/valuationService';
import { logger } from '../utils/logger';

export const marketplaceController = {
  // Create a new listing
  createListing: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const { tokenId, amount, price, expirationDate } = req.body;
      
      const listing = await marketService.createListing({
        tokenId,
        sellerId: req.user.id,
        amount,
        price,
        expirationDate: new Date(expirationDate)
      });
      
      return res.status(201).json({
        success: true,
        data: listing
      });
    } catch (error) {
      logger.error(`Error creating listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Get all active listings
  getListings: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, tokenId, minPrice, maxPrice, sellerId } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        tokenId: tokenId as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        sellerId: sellerId as string
      };
      
      const listings = await marketService.getListings(options);
      
      return res.status(200).json({
        success: true,
        count: listings.length,
        data: listings
      });
    } catch (error) {
      logger.error(`Error getting listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Execute a purchase transaction
  executePurchase: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const { listingId, amount } = req.body;
      
      const transaction = await marketService.executePurchase({
        listingId,
        buyerId: req.user.id,
        amount
      });
      
      return res.status(200).json({
        success: true,
        data: transaction
      });
    } catch (error) {
      logger.error(`Error executing purchase: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Cancel a listing
  cancelListing: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const { listingId } = req.params;
      
      const result = await marketService.cancelListing(listingId, req.user.id);
      
      if (!result) {
        return res.status(404).json({
          success: false,
          error: 'Listing not found or unauthorized'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      logger.error(`Error canceling listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  // Get transaction history
  getTransactionHistory: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, userId, tokenId, projectId, type } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        userId: userId as string || req.user?.id,
        tokenId: tokenId as string,
        projectId: projectId as string,
        type: type as string
      };
      
      const transactions = await marketService.getTransactionHistory(options);
      
      return res.status(200).json({
        success: true,
        count: transactions.length,
        data: transactions
      });
    } catch (error) {
      logger.error(`Error getting transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get my listings
  getMyListings: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const { page = 1, limit = 10, active } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sellerId: req.user.id
      };
      
      // Only include active listings if specified
      if (active === 'true') {
        Object.assign(options, { active: true });
      }
      
      const listings = await marketService.getListings(options);
      
      return res.status(200).json({
        success: true,
        count: listings.length,
        data: listings
      });
    } catch (error) {
      logger.error(`Error getting user listings: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get market summary
  getMarketSummary: async (req: Request, res: Response) => {
    try {
      const summary = await marketService.getMarketSummary();
      
      return res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      logger.error(`Error getting market summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get price history for a token
  getPriceHistory: async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.params;
      const { days = 30 } = req.query;
      
      const priceHistory = await valuationService.getMarketPriceHistory(
        tokenId,
        parseInt(days as string, 10)
      );
      
      return res.status(200).json({
        success: true,
        data: priceHistory
      });
    } catch (error) {
      logger.error(`Error getting price history: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Get price recommendation for a token
  getPriceRecommendation: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      const recommendation = await valuationService.getPriceRecommendation(projectId);
      
      return res.status(200).json({
        success: true,
        data: recommendation
      });
    } catch (error) {
      logger.error(`Error getting price recommendation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};