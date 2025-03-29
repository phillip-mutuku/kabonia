import {
    Client,
    AccountId,
    PrivateKey
  } from '@hashgraph/sdk';
  import { logger } from '../utils/logger';
  
  export const getHederaClient = (): Client => {
    try {
      const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID as string);
      const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY as string);
      
      // Create client based on network type (testnet/mainnet)
      let client: Client;
      
      if (process.env.HEDERA_NETWORK === 'mainnet') {
        client = Client.forMainnet();
      } else {
        client = Client.forTestnet();
      }
      
      // Set operator with account ID and private key
      client.setOperator(accountId, privateKey);
      
      logger.info('Hedera client initialized successfully');
      return client;
    } catch (error) {
      if (error instanceof Error) {
        logger.error(`Failed to initialize Hedera client: ${error.message}`);
      }
      throw error;
    }
  };