import {
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  Client,
  Key,
  PublicKey
} from '@hashgraph/sdk';
import { logger } from './logger';
import { getHederaClient } from '../config/hedera';
import { constants } from '../config/constants';

/**
* Create a new topic for a carbon project
* @param projectName - Name of the carbon project
* @returns The topic ID
*/
export const createTopic = async (projectName: string): Promise<string> => {
  try {
      const client = getHederaClient();

      // Safely handle potential null operatorPublicKey
      if (!client.operatorPublicKey) {
          throw new Error('Operator public key is not available');
      }

      const transaction = new TopicCreateTransaction()
          .setAdminKey(client.operatorPublicKey as Key)
          .setSubmitKey(client.operatorPublicKey as Key)
          .setTopicMemo(`CarbonX Project: ${projectName}`)
          .setMaxTransactionFee(10);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const topicId = receipt.topicId?.toString() as string;

      logger.info(`Topic created with ID: ${topicId}`);

      return topicId;
  } catch (error) {
      if (error instanceof Error) {
          logger.error(`Error creating topic: ${error.message}`);
      }
      throw error;
  }
};

/**
* Submit a message to a topic
* @param topicId - The topic ID
* @param message - The message to submit (will be JSON stringified)
* @returns Transaction ID
*/
export const submitMessage = async (topicId: string, message: any): Promise<string> => {
  try {
      const client = getHederaClient();
      const messageString = JSON.stringify(message);

      const transaction = new TopicMessageSubmitTransaction()
          .setTopicId(TopicId.fromString(topicId))
          .setMessage(messageString)
          .setMaxTransactionFee(5);

      const txResponse = await transaction.execute(client);
      const receipt = await txResponse.getReceipt(client);
      const transactionId = txResponse.transactionId.toString();

      logger.info(`Message submitted to topic ${topicId} with transaction ID: ${transactionId}`);

      return transactionId;
  } catch (error) {
      if (error instanceof Error) {
          logger.error(`Error submitting message: ${error.message}`);
      }
      throw error;
  }
};

/**
* Record a verification event to the ledger
* @param projectId - The project ID
* @param topicId - The topic ID
* @param verificationData - Verification data to record
* @returns Transaction ID
*/
export const recordVerificationEvent = async (
  projectId: string, 
  topicId: string, 
  verificationData: any
): Promise<string> => {
  try {
      const message = {
          type: 'VERIFICATION_EVENT',
          timestamp: new Date().toISOString(),
          projectId,
          ...verificationData
      };

      return await submitMessage(topicId, message);
  } catch (error) {
      if (error instanceof Error) {
          logger.error(`Error recording verification event: ${error.message}`);
      }
      throw error;
  }
};

/**
* Record a token transaction event to the ledger
* @param tokenId - The token ID
* @param topicId - The topic ID
* @param transactionData - Transaction data to record
* @returns Transaction ID
*/
export const recordTokenTransaction = async (
  tokenId: string, 
  topicId: string, 
  transactionData: any
): Promise<string> => {
  try {
      const message = {
          type: 'TOKEN_TRANSACTION',
          timestamp: new Date().toISOString(),
          tokenId,
          ...transactionData
      };

      return await submitMessage(topicId, message);
  } catch (error) {
      if (error instanceof Error) {
          logger.error(`Error recording token transaction: ${error.message}`);
      }
      throw error;
  }
};