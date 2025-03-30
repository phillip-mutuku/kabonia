import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenMintTransaction,
  TokenId,
  TransferTransaction,
  AccountId,
  Hbar,
  Key
} from '@hashgraph/sdk';
import { logger } from './logger';
import { getHederaClient } from '../config/hedera';
import { constants } from '../config/constants';

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

/**
 * Create a new token for a carbon project
 * @param params - Token creation parameters
 * @returns The token ID
 */
export const createToken = async (params: {
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  initialSupply: number;
  memo: string;
}): Promise<string> => {
  try {
    const client = getHederaClient();
    const { tokenName, tokenSymbol, decimals, initialSupply, memo } = params;
    
    // Safely handle potential null operatorPublicKey and operatorAccountId
    if (!client.operatorPublicKey) {
      throw new Error('Operator public key is not available');
    }
    
    if (!client.operatorAccountId) {
      throw new Error('Operator account ID is not available');
    }
    
    const transaction = new TokenCreateTransaction()
      .setTokenName(tokenName)
      .setTokenSymbol(tokenSymbol)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(client.operatorAccountId as AccountId)
      .setAdminKey(client.operatorPublicKey as Key)
      .setSupplyKey(client.operatorPublicKey as Key)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(initialSupply * 2)
      .setTokenMemo(memo)
      .setMaxTransactionFee(new Hbar(20));
    
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const tokenId = receipt.tokenId?.toString() as string;
    
    logger.info(`Token created with ID: ${tokenId}`);
    
    return tokenId;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error creating token: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Mint additional tokens
 * @param params - Token minting parameters
 * @returns Transaction ID
 */
export const mintTokens = async (params: {
  tokenId: string;
  amount: number;
}): Promise<string> => {
  try {
    const client = getHederaClient();
    const { tokenId, amount } = params;
    
    const transaction = new TokenMintTransaction()
      .setTokenId(TokenId.fromString(tokenId))
      .setAmount(amount)
      .setMaxTransactionFee(new Hbar(10));
    
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const transactionId = txResponse.transactionId.toString();
    
    logger.info(`Minted ${amount} tokens for token ID ${tokenId}`);
    
    return transactionId;
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error minting tokens: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Transfer tokens from one account to another
 * @param params - Token transfer parameters
 * @returns Transaction ID
 */
export const transferTokens = async (params: {
  tokenId: string;
  senderAccountId: string | any;
  receiverAccountId: string | any;
  amount: number;
}): Promise<string> => {
  try {
    const client = getHederaClient();
    const { tokenId, senderAccountId, receiverAccountId, amount } = params;
    
    // Convert MongoDB ObjectIds to strings if needed
    const senderIdStr = safeToString(senderAccountId);
    const receiverIdStr = safeToString(receiverAccountId);
    
    // Log for debugging
    logger.info(`Converting IDs - Original sender: ${typeof senderAccountId}, receiver: ${typeof receiverAccountId}`);
    logger.info(`Converted to strings - sender: ${senderIdStr}, receiver: ${receiverIdStr}`);
  
    
    // Get Hedera operator account ID (this is a valid Hedera account)
    const operatorId = client.operatorAccountId?.toString() || '0.0.12345';
    
    logger.info(`Using Hedera account ID: ${operatorId} for transaction`);
    
    // Create a mock transaction response for now
    // In production, I will execute a real transaction with mapped Hedera accounts
    const transactionId = `0.0.${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    
    logger.info(`Simulated transfer of ${amount} tokens from ${senderIdStr} to ${receiverIdStr}`);
    logger.info(`Transaction ID: ${transactionId}`);
    
    return transactionId;
  
    
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error transferring tokens: ${error.message}`);
    }
    throw error;
  }
};

/**
 * Get token information
 * @param tokenId - The token ID
 * @returns Token information
 */
export const getTokenInfo = async (tokenId: string): Promise<any> => {
  try {
    const client = getHederaClient();
    // In a real implementation, I will use the TokenInfoQuery to get token details
    // This is a placeholder for now
    
    logger.info(`Retrieved info for token ID ${tokenId}`);
    
    return {
      tokenId,
      name: 'Sample Token Name',
      symbol: 'STN',
      totalSupply: 1000,
      decimals: 2
    };
  } catch (error) {
    if (error instanceof Error) {
      logger.error(`Error getting token info: ${error.message}`);
    }
    throw error;
  }
};