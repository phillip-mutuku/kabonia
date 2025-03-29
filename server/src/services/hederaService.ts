import { getHederaClient } from '../config/hedera';
import { createTopic, submitMessage } from '../utils/hcsHelpers';
import { 
  createToken as createTokenHTS,
  mintTokens as mintTokensHTS,
  transferTokens as transferTokensHTS
} from '../utils/htsHelpers';
import { logger } from '../utils/logger';

/**
 * Helper function to safely convert any ID type to string
 */
const safeToString = (id: any): string => {
  if (id === null || id === undefined) {
    return '';
  }
  
  if (typeof id === 'string') {
    return id;
  }
  
  if (typeof id === 'object' && id !== null) {
    if (id.toString && typeof id.toString === 'function') {
      return id.toString();
    }
    if (id._id) {
      return safeToString(id._id);
    }
  }
  
  return String(id);
};

export const hederaService = {
  /**
   * Initialize a new project on Hedera
   * @param projectName - Name of the project
   * @returns Topic ID for the project
   */
  initializeProject: async (projectName: string): Promise<string> => {
    try {
      // Create a new topic for this project on Hedera Consensus Service
      const topicId = await createTopic(projectName);
      
      logger.info(`Initialized project ${projectName} with topic ID ${topicId}`);
      
      return topicId;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error initializing project on Hedera: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Create a new carbon credit token
   * @param params - Token creation parameters
   * @returns Token ID
   */
  createCarbonToken: async (params: {
    projectId: string;
    tokenName: string;
    tokenSymbol: string;
    decimals: number;
    initialSupply: number;
  }): Promise<string> => {
    try {
      const { projectId, tokenName, tokenSymbol, decimals, initialSupply } = params;
      
      // Create token on Hedera Token Service
      const tokenId = await createTokenHTS({
        tokenName,
        tokenSymbol,
        decimals,
        initialSupply,
        memo: `Carbon Credits for Project ${projectId}`
      });
      
      logger.info(`Created token ${tokenId} for project ${projectId}`);
      
      return tokenId;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error creating carbon token: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Mint additional carbon credit tokens
   * @param params - Token minting parameters
   * @returns Transaction ID
   */
  mintCarbonTokens: async (params: {
    tokenId: string;
    amount: number;
  }): Promise<string> => {
    try {
      const { tokenId, amount } = params;
      
      // Mint tokens on Hedera Token Service
      const transactionId = await mintTokensHTS({
        tokenId,
        amount
      });
      
      logger.info(`Minted ${amount} tokens for token ID ${tokenId}`);
      
      return transactionId;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error minting carbon tokens: ${error.message}`);
      }
      throw error;
    }
  },
  
/**
 * Transfer carbon credit tokens between accounts
 * @param params - Token transfer parameters
 * @returns Transaction ID
 */
transferCarbonTokens: async (params: {
  tokenId: string;
  senderAccountId: string | any;
  receiverAccountId: string | any;
  amount: number;
}): Promise<string> => {
  try {
    const { tokenId, senderAccountId, receiverAccountId, amount } = params;
    
    // Log the input parameters for debugging
    logger.info(`Transfer request - tokenId: ${tokenId}, sender: ${typeof senderAccountId}, receiver: ${typeof receiverAccountId}, amount: ${amount}`);
    
    // Convert MongoDB ObjectIds to strings if needed
    const senderIdStr = typeof senderAccountId === 'object' && senderAccountId !== null && senderAccountId.toString
      ? senderAccountId.toString()
      : String(senderAccountId);
      
    const receiverIdStr = typeof receiverAccountId === 'object' && receiverAccountId !== null && receiverAccountId.toString
      ? receiverAccountId.toString()
      : String(receiverAccountId);
    
    logger.info(`Using string IDs - sender: ${senderIdStr}, receiver: ${receiverIdStr}`);
    
    // Transfer tokens on Hedera Token Service with string IDs
    const transactionId = await transferTokensHTS({
      tokenId,
      senderAccountId: senderIdStr,
      receiverAccountId: receiverIdStr,
      amount
    });
    
    logger.info(`Transferred ${amount} tokens from ${senderIdStr} to ${receiverIdStr}`);
    
    return transactionId;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error transferring tokens: ${error.message}`);
    }
    throw error;
  }
},
  
  /**
   * Record a verification on the ledger
   * @param params - Verification recording parameters
   * @returns Transaction ID
   */
  recordVerification: async (params: {
    projectId: string;
    topicId: string;
    verificationId: string;
    status: string;
    carbonAmount: number;
    verifierId: string;
  }): Promise<string> => {
    try {
      const { projectId, topicId, verificationId, status, carbonAmount, verifierId } = params;
      
      // Prepare verification message
      const message = {
        type: 'VERIFICATION',
        projectId: safeToString(projectId),
        verificationId: safeToString(verificationId),
        status,
        carbonAmount,
        verifierId: safeToString(verifierId),
        timestamp: new Date().toISOString()
      };
      
      // Submit message to Hedera Consensus Service
      const transactionId = await submitMessage(topicId, message);
      
      logger.info(`Recorded verification ${verificationId} for project ${projectId}`);
      
      return transactionId;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error recording verification: ${error.message}`);
      }
      throw error;
    }
  },
  
  /**
   * Record a token transaction on the ledger
   * @param params - Transaction recording parameters
   * @returns Transaction ID
   */
  recordTransaction: async (params: {
    projectId: string | any;
    topicId: string;
    tokenId: string;
    transactionType: string;
    senderId?: string | any;
    receiverId: string | any;
    amount: number;
    price?: number;
  }): Promise<string> => {
    try {
      const { projectId, topicId, tokenId, transactionType, senderId, receiverId, amount, price } = params;
      
      // Convert IDs to strings
      const projectIdStr = safeToString(projectId);
      const senderIdStr = senderId ? safeToString(senderId) : undefined;
      const receiverIdStr = safeToString(receiverId);
      
      // Log the converted IDs for debugging
      logger.info(`Recording transaction: projectId=${projectIdStr}, tokenId=${tokenId}, type=${transactionType}`);
      
      // Check receiverId is valid
      if (!receiverIdStr) {
        throw new Error(`Invalid receiver ID: ${receiverId}`);
      }
      
      // Prepare transaction message
      const message = {
        type: 'TOKEN_TRANSACTION',
        projectId: projectIdStr,
        tokenId,
        transactionType,
        senderId: senderIdStr,
        receiverId: receiverIdStr,
        amount,
        price,
        timestamp: new Date().toISOString()
      };
      
      // Submit message to Hedera Consensus Service
      const transactionId = await submitMessage(topicId, message);
      
      logger.info(`Recorded ${transactionType} transaction for token ${tokenId}`);
      
      return transactionId;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Error recording transaction: ${error.message}`);
      }
      throw error;
    }
  }
};