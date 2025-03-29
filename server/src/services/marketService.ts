import { Listing, IListing } from '../models/Listing';
import { Transaction } from '../models/Transaction';
import { Token } from '../models/Token';
import { Project } from '../models/Project';
import { tokenService } from './tokenService';
import { hederaService } from './hederaService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { constants } from '../config/constants';
import mongoose from 'mongoose';

export const marketService = {
  /**
   * Create a new token listing in the marketplace
   * @param params - Listing parameters
   * @returns The created listing
   */
  createListing: async (params: {
    tokenId: string;
    sellerId: string;
    amount: number;
    price: number;
    expirationDate: Date;
  }): Promise<IListing> => {
    try {
      const { tokenId, sellerId, amount, price, expirationDate } = params;
      
      // Find token
      const token = await Token.findOne({ tokenId });
      if (!token) {
        throw new AppError(`Token not found: ${tokenId}`, 404);
      }
      
      // Find project
      const project = await Project.findById(token.projectId);
      if (!project) {
        throw new AppError(`Project not found: ${token.projectId}`, 404);
      }
      
      // Check if project is active
      if (project.status !== constants.PROJECT_STATUS.ACTIVE) {
        throw new AppError(`Project must be active to list tokens, current status: ${project.status}`, 400);
      }
      
      // Check if seller has enough tokens
      const sellerBalance = await tokenService.getTokenBalance(tokenId, sellerId);
      if (sellerBalance < amount) {
        throw new AppError(`Not enough tokens to list. You have ${sellerBalance} tokens, tried to list ${amount}`, 400);
      }
      
      // Create listing
      const listing = new Listing({
        tokenId,
        projectId: token.projectId,
        sellerId: new mongoose.Types.ObjectId(sellerId),
        amount,
        remaining: amount,
        price,
        expirationDate,
        active: true
      });
      
      await listing.save();
      
      logger.info(`Created listing for ${amount} tokens at ${price} each`);
      
      return listing;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error creating listing: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get active listings with optional filtering
   * @param options - Filter options
   * @returns Array of listings
   */
  getListings: async (options: {
    page?: number;
    limit?: number;
    tokenId?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
  }): Promise<IListing[]> => {
    try {
      const { 
        page = 1, 
        limit = constants.DEFAULT_PAGE_SIZE,
        tokenId,
        minPrice,
        maxPrice,
        sellerId
      } = options;
      
      // Build query
      const query: any = {
        active: true,
        expirationDate: { $gt: new Date() },
        remaining: { $gt: 0 }
      };
      
      if (tokenId) {
        query.tokenId = tokenId;
      }
      
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined) {
          query.price.$gte = minPrice;
        }
        if (maxPrice !== undefined) {
          query.price.$lte = maxPrice;
        }
      }
      
      if (sellerId) {
        query.sellerId = sellerId;
      }
      
      // Execute query with pagination
      const listings = await Listing.find(query)
        .sort({ price: 1, createdAt: -1 }) // Sort by price ascending, then newest first
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('projectId', 'name location')
        .populate('sellerId', 'name email');
      
      return listings;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting listings: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Execute a purchase transaction
   * @param params - Purchase parameters
   * @returns Transaction record
   */
  executePurchase: async (params: {
    listingId: string;
    buyerId: string;
    amount: number;
  }): Promise<any> => {
    try {
      const { listingId, buyerId, amount } = params;
      
      // Convert listingId to MongoDB ObjectId if it's not already
      let listingObjectId;
      try {
        // Check if it's already a valid ObjectId
        if (mongoose.Types.ObjectId.isValid(listingId)) {
          listingObjectId = new mongoose.Types.ObjectId(listingId);
        } else {
          // Log the problematic ID for debugging
          logger.error(`Invalid ObjectId format: ${listingId}`);
          throw new AppError(`Invalid listing ID format: ${listingId}`, 400);
        }
      } catch (error) {
        logger.error(`Failed to parse entity id: ${listingId}`);
        throw new AppError(`Failed to parse listing ID: ${listingId}`, 400);
      }
      
      // Find listing using the properly formatted ObjectId
      const listing = await Listing.findById(listingObjectId);
      if (!listing) {
        throw new AppError(`Listing not found: ${listingId}`, 404);
      }
      
      // Check if listing is active
      if (!listing.active) {
        throw new AppError('This listing is no longer active', 400);
      }
      
      // Check if listing has expired
      if (new Date(listing.expirationDate) < new Date()) {
        throw new AppError('This listing has expired', 400);
      }
      
      // Check if enough tokens remain
      if (listing.remaining < amount) {
        throw new AppError(`Not enough tokens available. Requested: ${amount}, Available: ${listing.remaining}`, 400);
      }
      
      // Check if buyer and seller are different
      if (listing.sellerId.toString() === buyerId) {
        throw new AppError('You cannot buy your own listing', 400);
      }
      
      // Find token and project
      const token = await Token.findOne({ tokenId: listing.tokenId });
      if (!token) {
        throw new AppError(`Token not found: ${listing.tokenId}`, 404);
      }
      
      const project = await Project.findById(token.projectId);
      if (!project) {
        throw new AppError(`Project not found: ${token.projectId}`, 404);
      }
      
      // Calculate total price
      const totalPrice = amount * listing.price;
      
      // Transfer tokens on Hedera (would be implemented with HashPack or similar in frontend)
      const hederaTransactionId = await hederaService.transferCarbonTokens({
        tokenId: listing.tokenId,
        senderAccountId: listing.sellerId.toString(),
        receiverAccountId: buyerId,
        amount
      });
      
      // Record transaction on ledger
      const consensusTransactionId = await hederaService.recordTransaction({
        projectId: project._id.toString(),
        topicId: project.topicId as string,
        tokenId: listing.tokenId,
        transactionType: constants.TRANSACTION_TYPES.BUY,
        senderId: listing.sellerId.toString(),
        receiverId: buyerId,
        amount,
        price: listing.price
      });
      
      // Create transaction record
      const transaction = await Transaction.create({
        transactionId: hederaTransactionId,
        tokenId: listing.tokenId,
        projectId: token.projectId,
        type: constants.TRANSACTION_TYPES.BUY,
        sender: listing.sellerId,
        receiver: new mongoose.Types.ObjectId(buyerId),
        amount,
        price: listing.price,
        totalPrice,
        status: 'confirmed',
        memo: `Purchased ${amount} tokens at ${listing.price} each`,
        consensusTimestamp: new Date(),
        listingId: listing._id
      });
      
      // Update listing
      listing.remaining -= amount;
      if (listing.remaining <= 0) {
        listing.active = false;
      }
      await listing.save();
      
      logger.info(`Executed purchase of ${amount} tokens from listing ${listingId}`);
      
      return {
        transaction,
        listing: {
          id: listing._id,
          tokenId: listing.tokenId,
          remaining: listing.remaining,
          active: listing.active
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error executing purchase: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Cancel a listing
   * @param listingId - Listing ID
   * @param userId - User ID (for ownership check)
   * @returns Success flag
   */
  cancelListing: async (listingId: string, userId: string): Promise<boolean> => {
    try {
      // Find listing
      const listing = await Listing.findById(listingId);
      if (!listing) {
        return false;
      }
      
      // Check if user is the seller
      if (listing.sellerId.toString() !== userId) {
        throw new AppError('Not authorized to cancel this listing', 403);
      }
      
      // Check if listing is active
      if (!listing.active) {
        throw new AppError('This listing is already inactive', 400);
      }
      
      // Cancel listing
      listing.active = false;
      await listing.save();
      
      logger.info(`Cancelled listing ${listingId}`);
      
      return true;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error cancelling listing: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get transaction history
   * @param options - Filter options
   * @returns Array of transactions
   */
  getTransactionHistory: async (options: {
    page?: number;
    limit?: number;
    userId?: string;
    tokenId?: string;
    projectId?: string;
    type?: string;
  }): Promise<any[]> => {
    try {
      const { 
        page = 1, 
        limit = constants.DEFAULT_PAGE_SIZE,
        userId,
        tokenId,
        projectId,
        type
      } = options;
      
      // Build query
      const query: any = {
        status: 'confirmed'
      };
      
      if (userId) {
        query.$or = [
          { sender: userId },
          { receiver: userId }
        ];
      }
      
      if (tokenId) {
        query.tokenId = tokenId;
      }
      
      if (projectId) {
        query.projectId = projectId;
      }
      
      if (type) {
        query.type = type;
      }
      
      // Execute query with pagination
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('sender', 'name email')
        .populate('receiver', 'name email')
        .populate('projectId', 'name location');
      
      return transactions;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting transaction history: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Get market summary statistics
   * @returns Market summary data
   */
  getMarketSummary: async (): Promise<any> => {
    try {
      // Get recent transactions
      const recentTransactions = await Transaction.find({
        status: 'confirmed',
        type: { $in: [constants.TRANSACTION_TYPES.BUY, constants.TRANSACTION_TYPES.SELL] },
        price: { $exists: true }
      })
        .sort({ createdAt: -1 })
        .limit(100);
      
      // Calculate average price
      const prices = recentTransactions.map(tx => tx.price || 0).filter(price => price > 0);
      const averagePrice = prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;
      
      // Get active listings count
      const activeListingsCount = await Listing.countDocuments({
        active: true,
        expirationDate: { $gt: new Date() },
        remaining: { $gt: 0 }
      });
      
      // Get total volume traded
      const totalVolume = await Transaction.aggregate([
        {
          $match: {
            status: 'confirmed',
            type: { $in: [constants.TRANSACTION_TYPES.BUY, constants.TRANSACTION_TYPES.SELL] }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            totalValue: { $sum: '$totalPrice' }
          }
        }
      ]);
      
      return {
        averagePrice,
        activeListingsCount,
        totalVolumeTraded: totalVolume.length > 0 ? totalVolume[0].totalAmount : 0,
        totalValueTraded: totalVolume.length > 0 ? totalVolume[0].totalValue : 0,
        recentTransactions: recentTransactions.slice(0, 5) // Return only 5 most recent
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting market summary: ${error.message}`);
      }
      throw error;
    }
  }
};