import { Request, Response } from 'express';
import { tokenService } from '../services/tokenService';
import { logger } from '../utils/logger';

export const tokenController = {
  /**
   * Tokenize a verified project
   */
  tokenizeProject: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
      
      // Optional additional parameters
      const { 
        carbonCredits, 
        notes, 
        verificationMethod 
      } = req.body;
      
      const tokenization = await tokenService.tokenizeVerifiedProject(
        projectId, 
        req.user.id,
        {
          carbonCredits,
          notes,
          verificationMethod
        }
      );
      
      return res.status(201).json({
        success: true,
        data: tokenization
      });
    } catch (error) {
      logger.error(`Error tokenizing project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  /**
   * Check tokenization readiness for a project
   */
  checkTokenizationReadiness: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      const readiness = await tokenService.checkTokenizationReadiness(projectId);
      
      return res.status(200).json({
        success: true,
        data: readiness
      });
    } catch (error) {
      logger.error(`Error checking tokenization readiness: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
 //create token
 
  createToken: async (req: Request, res: Response) => {
    try {
      const { projectId, initialSupply, tokenName, tokenSymbol, decimals } = req.body;
      
      // Ensure user is authenticated
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
      
      // tokenizeVerifiedProject
      const token = await tokenService.tokenizeVerifiedProject(
        projectId,
        userId,
        {
          carbonCredits: initialSupply, 
          notes: `Token created with name: ${tokenName}, symbol: ${tokenSymbol}, decimals: ${decimals || 2}`
        }
      );
      
      return res.status(201).json({
        success: true,
        data: token
      });
    } catch (error) {
      logger.error(`Error creating token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Existing methods remain the same
  getTokens: async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10, projectId } = req.query;
      
      const options = {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        projectId: projectId as string
      };
      
      const tokens = await tokenService.getTokens(options);
      
      return res.status(200).json({
        success: true,
        count: tokens.length,
        data: tokens
      });
    } catch (error) {
      logger.error(`Error getting tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  getTokenById: async (req: Request, res: Response) => {
    try {
      const token = await tokenService.getTokenById(req.params.id);
      
      if (!token) {
        return res.status(404).json({
          success: false,
          error: 'Token not found'
        });
      }
      
      return res.status(200).json({
        success: true,
        data: token
      });
    } catch (error) {
      logger.error(`Error getting token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  transferToken: async (req: Request, res: Response) => {
    try {
      const { tokenId, receiverId, amount } = req.body;
      
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
      
      const result = await tokenService.transferToken({
        tokenId,
        senderId: req.user.id,
        receiverId,
        amount
      });
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Error transferring token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  mintTokens: async (req: Request, res: Response) => {
    try {
      const { tokenId, amount } = req.body;
      
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
      
      const result = await tokenService.mintTokens({
        tokenId,
        amount,
        ownerId: req.user.id
      });
      
      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error(`Error minting tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Server Error'
      });
    }
  },
  
  getTokenBalance: async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.params;
      
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
      
      const balance = await tokenService.getTokenBalance(tokenId, req.user.id);
      
      return res.status(200).json({
        success: true,
        data: {
          tokenId,
          balance
        }
      });
    } catch (error) {
      logger.error(`Error getting token balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  // Existing methods remain the same
  getMyTokens: async (req: Request, res: Response) => {
    try {
      // Ensure user is authenticated
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }
      
      // Get all tokens
      const tokens = await tokenService.getTokens({});
      
      // For each token, get the user's balance
      const tokenBalances = await Promise.all(
        tokens.map(async (token) => {
          // Add an additional check to satisfy TypeScript
          const userId = req.user?.id;
          if (!userId) {
            throw new Error('User ID is undefined');
          }
          
          const balance = await tokenService.getTokenBalance(token.tokenId, userId);
          return {
            tokenId: token.tokenId,
            tokenName: token.tokenName,
            tokenSymbol: token.tokenSymbol,
            projectId: token.projectId,
            balance
          };
        })
      );
      
      // Filter out tokens with zero balance
      const nonZeroBalances = tokenBalances.filter(token => token.balance > 0);
      
      return res.status(200).json({
        success: true,
        count: nonZeroBalances.length,
        data: nonZeroBalances
      });
    } catch (error) {
      logger.error(`Error getting user tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  getProjectTokens: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      const tokens = await tokenService.getTokens({
        projectId
      });
      
      return res.status(200).json({
        success: true,
        count: tokens.length,
        data: tokens
      });
    } catch (error) {
      logger.error(`Error getting project tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },
  
  tokenizeVerifiedProject: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized: User not authenticated'
        });
      }

      const tokenization = await tokenService.tokenizeVerifiedProject(
        projectId, 
        userId, 
        req.body
      );

      return res.status(201).json({
        success: true,
        data: tokenization
      });
    } catch (error) {
      logger.error(`Error tokenizing project: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Generate token report
   */
  generateTokenReport: async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      
      const report = await tokenService.generateTokenReport(projectId);
      
      return res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      logger.error(`Error generating token report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  },

  /**
   * Get token analytics
   */
  getTokenAnalytics: async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.params;
      const { 
        startDate, 
        endDate, 
        transactionTypes 
      } = req.query;
      
      const analytics = await tokenService.getTokenAnalytics(
        tokenId as string,
        {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          transactionTypes: transactionTypes 
            ? (transactionTypes as string).split(',') 
            : undefined
        }
      );
      
      return res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error(`Error getting token analytics: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return res.status(500).json({
        success: false,
        error: 'Server Error'
      });
    }
  }
};

export default tokenController;