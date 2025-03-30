import { Token, IToken } from '../models/Token';
import { Project } from '../models/Project';
import { Transaction } from '../models/Transaction';
import { hederaService } from './hederaService';
import { valuationService } from './valuationService';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { constants } from '../config/constants';
import mongoose from 'mongoose';

// Define an interface for tokenization options
interface TokenizationOptions {
  carbonCredits?: number;
  notes?: string;
  verificationMethod?: string;
  aiAnalysis?: any;
}

// Define an interface for token analytics options
interface TokenAnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  transactionTypes?: string[];
}

export const tokenService = {
  tokenizeVerifiedProject: async (
    projectId: string, 
    userId: string, 
    options: {
      carbonCredits?: number;
      notes?: string;
      verificationMethod?: string;
      aiAnalysis?: any;
    } = {}
  ) => {
    try {
      // 1. Find the project
      const project = await Project.findById(projectId);
      if (!project) {
        throw new AppError(`Project ${projectId} not found`, 404);
      }
  
      // 2. Validate project status
      if (project.status !== constants.PROJECT_STATUS.VERIFIED && 
          project.status !== constants.PROJECT_STATUS.ACTIVE) {
        throw new AppError(
          `Project must be verified or active. Current status: ${project.status}`, 
          400
        );
      }
  
      // 3. Check if project already has a token
      const existingToken = await Token.findOne({ projectId });
      if (existingToken) {
        throw new AppError(`Project already has a token: ${existingToken.tokenId}`, 400);
      }
  
      // 4. Get AI-powered valuation if not provided
      const aiAnalysis = options.aiAnalysis || await valuationService.getAIPrediction({
        projectType: project.projectType,
        area: project.area,
        location: project.location,
        estimatedCarbonCapture: project.estimatedCarbonCapture,
        startDate: project.startDate,
        endDate: project.endDate
      });
  
      // 5. Determine carbon credits
      const carbonCredits = options.carbonCredits || 
        (aiAnalysis.recommendedCarbonCredits || project.estimatedCarbonCapture);
  
      // 6. Create token on Hedera
      const tokenId = await hederaService.createCarbonToken({
        projectId,
        tokenName: `${project.name} Carbon Credits`,
        tokenSymbol: `CC_${project.projectType.substring(0, 3).toUpperCase()}`,
        decimals: constants.DEFAULT_DECIMALS,
        initialSupply: carbonCredits
      });
  
      // 7. Create token record in database
      const token = new Token({
        tokenId,
        projectId,
        tokenName: `${project.name} Carbon Credits`,
        tokenSymbol: `CC_${project.projectType.substring(0, 3).toUpperCase()}`,
        decimals: constants.DEFAULT_DECIMALS,
        initialSupply: carbonCredits,
        currentSupply: carbonCredits,
        maxSupply: carbonCredits * 2,
        creator: new mongoose.Types.ObjectId(userId),
        creationDate: new Date(),
        metadata: {
          projectName: project.name,
          location: project.location,
          estimatedCarbonCapture: project.estimatedCarbonCapture,
          actualCarbonCapture: project.actualCarbonCapture,
          verificationDate: project.verificationHistory[project.verificationHistory.length - 1]?.date,
          aiAnalysis: JSON.stringify(aiAnalysis),
          verificationInfo: options.verificationMethod || 'auto',
          notes: options.notes
        }
      });
  
      // 8. Save token without session
      await token.save();
  
      // 9. Update project
      project.tokenId = tokenId;
      project.status = constants.PROJECT_STATUS.ACTIVE;
      project.verificationHistory.push({
        date: new Date(),
        status: 'TOKENIZED',
        notes: options.notes || 'Project tokenized' + (options.verificationMethod ? ` (Method: ${options.verificationMethod})` : ''),
        verifier: new mongoose.Types.ObjectId(userId)
      });
      await project.save();
  
      // 10. Record mint transaction on Hedera
      const transactionId = await hederaService.recordTransaction({
        projectId,
        topicId: project.topicId as string,
        tokenId,
        transactionType: constants.TRANSACTION_TYPES.MINT,
        receiverId: userId,
        amount: carbonCredits
      });
  
      // 11. Create transaction record
      const transaction = await Transaction.create({
        transactionId,
        tokenId,
        projectId: new mongoose.Types.ObjectId(projectId),
        type: constants.TRANSACTION_TYPES.MINT,
        receiver: new mongoose.Types.ObjectId(userId),
        amount: carbonCredits,
        status: 'confirmed',
        memo: `Initial minting of ${token.tokenName} tokens for project ${project.name}`
      });
  
      logger.info(`Tokenized project ${projectId}. Token ID: ${tokenId}`);
  
      return {
        project,
        token,
        aiAnalysis,
        transaction,
        transactionId
      };
    } catch (error) {
      logger.error(`Tokenization failed for project ${projectId}: ${error}`);
      throw error;
    }
  },

  /**
   * Check if a project is ready for tokenization
   * @param projectId Project unique identifier
   * @returns Tokenization readiness status
   */
  checkTokenizationReadiness: async (projectId: string) => {
    try {
      const project = await Project.findById(projectId);
      
      if (!project) {
        return {
          isReady: false,
          reason: 'Project not found'
        };
      }

      // Criteria for tokenization
      const checks = {
        isVerified: project.status === constants.PROJECT_STATUS.VERIFIED,
        hasValidVerification: project.verificationHistory.some(
          v => v.status === 'approved'
        ),
        hasCarbonCredits: project.estimatedCarbonCapture > 0,
        noExistingToken: !project.tokenId
      };

      const isReady = Object.values(checks).every(Boolean);

      return {
        isReady,
        details: checks,
        project
      };
    } catch (error) {
      logger.error(`Error checking tokenization readiness: ${error}`);
      throw error;
    }
  },

  /**
   * Batch process verified projects for tokenization
   */
  processVerifiedProjects: async () => {
    try {
      // Find verified projects without tokens
      const verifiedProjects = await Project.find({
        status: constants.PROJECT_STATUS.VERIFIED,
        tokenId: { $exists: false }
      });

      // Process each project
      for (const project of verifiedProjects) {
        try {
          // Use a system user ID for automated processing
          const systemUserId = process.env.SYSTEM_USER_ID || 'system';
          
          await tokenService.tokenizeVerifiedProject(
            project._id.toString(), 
            systemUserId
          );
        } catch (projectError) {
          logger.error(`Failed to tokenize project ${project._id}: ${projectError}`);
        }
      }

      logger.info(`Processed ${verifiedProjects.length} verified projects`);
    } catch (error) {
      logger.error(`Error in batch project tokenization: ${error}`);
    }
  },

  /**
   * Get all tokens with optional filtering
   * @param options - Filter options
   * @returns Array of tokens
   */
  getTokens: async (options: {
    page?: number;
    limit?: number;
    projectId?: string;
  }): Promise<IToken[]> => {
    try {
      const { 
        page = 1, 
        limit = constants.DEFAULT_PAGE_SIZE,
        projectId
      } = options;
      
      // Build query
      const query: any = {};
      
      if (projectId) {
        query.projectId = projectId;
      }
      
      // Execute query with pagination
      const tokens = await Token.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('projectId', 'name location')
        .populate('creator', 'name email');
      
      return tokens;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting tokens: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Get a token by ID
   * @param tokenId - Token ID (Hedera token ID)
   * @returns Token or null if not found
   */
  getTokenById: async (tokenId: string): Promise<IToken | null> => {
    try {
      const token = await Token.findOne({ tokenId })
        .populate('projectId', 'name location status')
        .populate('creator', 'name email');
      
      return token;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting token by ID: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Mint additional tokens
   * @param params - Token minting parameters
   * @returns Transaction record
   */
  mintTokens: async (params: {
    tokenId: string;
    amount: number;
    ownerId: string;
  }): Promise<any> => {
    try {
      const { tokenId, amount, ownerId } = params;
      
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
      
      // Check if user is the project owner
      if (project.owner.toString() !== ownerId) {
        throw new AppError('Not authorized to mint tokens for this project', 403);
      }
      
      // Check if project is active
      if (project.status !== constants.PROJECT_STATUS.ACTIVE) {
        throw new AppError(`Project must be active to mint tokens, current status: ${project.status}`, 400);
      }
      
      // Check if minting would exceed max supply
      const maxSupply = token.maxSupply || Number.MAX_SAFE_INTEGER;
      if (token.currentSupply + amount > maxSupply) {
        throw new AppError(`Minting ${amount} tokens would exceed the maximum supply of ${maxSupply}`, 400);
      }
        
      // Mint tokens on Hedera
      const hederaTransactionId = await hederaService.mintCarbonTokens({
        tokenId,
        amount
      });
      
      // Update token record
      token.currentSupply += amount;
      token.lastMintDate = new Date();
      await token.save();
      
      // Record transaction on ledger
      const consensusTransactionId = await hederaService.recordTransaction({
        projectId: project._id.toString(),
        topicId: project.topicId as string,
        tokenId,
        transactionType: constants.TRANSACTION_TYPES.MINT,
        receiverId: ownerId,
        amount
      });
      
      // Create transaction record
      const transaction = await Transaction.create({
        transactionId: hederaTransactionId,
        tokenId,
        projectId: project._id,
        type: constants.TRANSACTION_TYPES.MINT,
        receiver: new mongoose.Types.ObjectId(ownerId),
        amount,
        status: 'confirmed',
        memo: `Minted ${amount} additional tokens for project ${project.name}`,
        consensusTimestamp: new Date()
      });
      
      logger.info(`Minted ${amount} tokens for token ${tokenId}`);
      
      return {
        transaction,
        token: {
          tokenId: token.tokenId,
          currentSupply: token.currentSupply,
          lastMintDate: token.lastMintDate
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error minting tokens: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Transfer tokens between users
   * @param params - Token transfer parameters
   * @returns Transaction record
   */
  transferToken: async (params: {
    tokenId: string;
    senderId: string;
    receiverId: string;
    amount: number;
  }): Promise<any> => {
    try {
      const { tokenId, senderId, receiverId, amount } = params;
      
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
      
      // Transfer tokens on Hedera
      const hederaTransactionId = await hederaService.transferCarbonTokens({
        tokenId,
        senderAccountId: senderId,
        receiverAccountId: receiverId,
        amount
      });
      
      // Record transaction on ledger
      const consensusTransactionId = await hederaService.recordTransaction({
        projectId: project._id.toString(),
        topicId: project.topicId as string,
        tokenId,
        transactionType: constants.TRANSACTION_TYPES.TRANSFER,
        senderId,
        receiverId,
        amount
      });
      
      // Create transaction record
      const transaction = await Transaction.create({
        transactionId: hederaTransactionId,
        tokenId,
        projectId: project._id,
        type: constants.TRANSACTION_TYPES.TRANSFER,
        sender: new mongoose.Types.ObjectId(senderId),
        receiver: new mongoose.Types.ObjectId(receiverId),
        amount,
        status: 'confirmed',
        memo: `Transferred ${amount} tokens from user ${senderId} to user ${receiverId}`,
        consensusTimestamp: new Date()
      });
      
      logger.info(`Transferred ${amount} tokens from ${senderId} to ${receiverId}`);
      
      return {
        transaction,
        token: {
          tokenId: token.tokenId,
          currentSupply: token.currentSupply
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error transferring tokens: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Get token balance for a user
   * @param tokenId - Token ID
   * @param userId - User ID
   * @returns The user's token balance
   */
  getTokenBalance: async (tokenId: string, userId: string): Promise<number> => {
    try {
      
      // Find all incoming transactions (receive)
      const incomingTransactions = await Transaction.find({
        tokenId,
        receiver: userId,
        status: 'confirmed'
      });
      
      // Find all outgoing transactions (send)
      const outgoingTransactions = await Transaction.find({
        tokenId,
        sender: userId,
        status: 'confirmed'
      });
      
      // Calculate balance
      const incomingTotal = incomingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      const outgoingTotal = outgoingTransactions.reduce((sum, tx) => sum + tx.amount, 0);
      
      const balance = incomingTotal - outgoingTotal;
      
      return balance;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error getting token balance: ${error.message}`);
      }
      throw error;
    }
  },

  /**
   * Generate comprehensive token report
   * @param projectId Project identifier
   * @returns Detailed token report
   */
  generateTokenReport: async (projectId: string) => {
    try {
      // Find the token associated with the project
      const token = await Token.findOne({ projectId })
        .populate('projectId')
        .populate('creator', 'name email');

      if (!token) {
        throw new AppError(`No token found for project ${projectId}`, 404);
      }

      // Get transaction history
      const transactions = await Transaction.find({ 
        projectId: new mongoose.Types.ObjectId(projectId) 
      })
        .sort({ consensusTimestamp: -1 })
        .limit(50)
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      // Get market price history
      const priceHistory = await valuationService.getMarketPriceHistory(token.tokenId);

      // Calculate token metrics
      const maxSupply = token.maxSupply || token.initialSupply * 2;
      const metrics = {
        currentSupply: token.currentSupply,
        maxSupply: maxSupply,
        supplyUtilization: (token.currentSupply / maxSupply) * 100,
        lastMintDate: token.lastMintDate,
        creationDate: token.creationDate,
        marketValue: priceHistory[priceHistory.length - 1]?.price || 0
      };

      return {
        token,
        project: token.projectId,
        transactions,
        priceHistory,
        metrics
      };
    } catch (error) {
      logger.error(`Error generating token report: ${error}`);
      throw error;
    }
  },

  /**
   * Get token analytics
   */
  getTokenAnalytics: async (
    tokenId: string, 
    options: TokenAnalyticsOptions = {}
  ) => {
    try {
      // Find the token
      const token = await Token.findOne({ tokenId })
        .populate('projectId', 'name location');

      if (!token) {
        throw new AppError(`Token not found: ${tokenId}`, 404);
      }

      // Build transaction query
      const transactionQuery: any = { tokenId };
      
      if (options.startDate) {
        transactionQuery.consensusTimestamp = { 
          $gte: options.startDate 
        };
      }

      if (options.endDate) {
        transactionQuery.consensusTimestamp = {
          ...(transactionQuery.consensusTimestamp || {}),
          $lte: options.endDate
        };
      }

      if (options.transactionTypes && options.transactionTypes.length > 0) {
        transactionQuery.type = { $in: options.transactionTypes };
      }

      // Fetch transactions
      const transactions = await Transaction.find(transactionQuery)
        .sort({ consensusTimestamp: 1 })
        .populate('sender', 'name email')
        .populate('receiver', 'name email');

      // Aggregate transaction metrics
      const transactionMetrics = {
        total: transactions.length,
        totalVolume: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        transactionTypes: transactions.reduce((acc: any, tx) => {
          acc[tx.type] = (acc[tx.type] || 0) + 1;
          return acc;
        }, {})
      };

      // Get market trends
      const marketTrends = await valuationService.getMarketPriceHistory(tokenId);

      return {
        token,
        transactions,
        transactionMetrics,
        marketTrends
      };
    } catch (error) {
      logger.error(`Error getting token analytics: ${error}`);
      throw error;
    }
  }
};

export default tokenService;