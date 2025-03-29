import { 
    Client, 
    AccountId, 
    PrivateKey, 
    TokenId, 
    TokenAssociateTransaction, 
    TokenCreateTransaction, 
    TokenMintTransaction, 
    TransferTransaction,
    Hbar,
    TransactionResponse,
    PublicKey,
    TokenSupplyType
  } from '@hashgraph/sdk';
  import { NETWORK_TYPE } from './constants';
  
  // Create Hedera client
  export const createHederaClient = (accountId?: string, privateKey?: string): Client | null => {
    if (!accountId || !privateKey) return null;
    
    try {
      const client = Client.forName(NETWORK_TYPE);
      client.setOperator(AccountId.fromString(accountId), PrivateKey.fromString(privateKey));
      return client;
    } catch (error) {
      console.error('Error creating Hedera client:', error);
      return null;
    }
  };
  
  // Create a fungible token
  export const createFungibleToken = async (
    client: Client,
    name: string,
    symbol: string,
    initialSupply: number = 0,
    decimals: number = 2,
    maxSupply: number | null = null
  ): Promise<string | null> => {
    try {
      const treasuryAccountId = client.operatorAccountId as AccountId;
      const treasuryKey = client.operatorPublicKey;
      
      let transaction = new TokenCreateTransaction()
      .setTokenName(name)
      .setTokenSymbol(symbol)
      .setDecimals(decimals)
      .setInitialSupply(initialSupply)
      .setTreasuryAccountId(treasuryAccountId)
      .setSupplyType(maxSupply === null ? TokenSupplyType.Infinite : TokenSupplyType.Finite)
      .setAdminKey(treasuryKey)
      .setSupplyKey(treasuryKey)
      .setFreezeDefault(false);
      
      if (treasuryKey) {
        transaction = transaction.setAdminKey(treasuryKey).setSupplyKey(treasuryKey);
      }
      
      transaction = transaction.freezeWith(client);
      
      const signTx = await transaction.sign(PrivateKey.fromString(client.operatorAccountId?.toString() || ''));
      const txResponse = await signTx.execute(client);
      const receipt = await txResponse.getReceipt(client);
      
      const tokenId = receipt.tokenId?.toString();
      return tokenId || null;
    } catch (error) {
      console.error('Error creating fungible token:', error);
      return null;
    }
  };
  
  // Mint additional tokens
  export const mintTokens = async (
    client: Client,
    tokenId: string,
    amount: number
  ): Promise<boolean> => {
    try {
      const transaction = await new TokenMintTransaction()
        .setTokenId(TokenId.fromString(tokenId))
        .setAmount(amount)
        .freezeWith(client)
        .sign(PrivateKey.fromString(client.operatorAccountId?.toString() || ''));
      
      const response = await transaction.execute(client);
      await response.getReceipt(client);
      
      return true;
    } catch (error) {
      console.error('Error minting tokens:', error);
      return false;
    }
  };
  
  // Associate a token with an account
  export const associateToken = async (
    client: Client,
    accountId: string,
    tokenId: string
  ): Promise<boolean> => {
    try {
      const transaction = await new TokenAssociateTransaction()
        .setAccountId(AccountId.fromString(accountId))
        .setTokenIds([TokenId.fromString(tokenId)])
        .freezeWith(client)
        .sign(PrivateKey.fromString(client.operatorAccountId?.toString() || ''));
      
      const response = await transaction.execute(client);
      await response.getReceipt(client);
      
      return true;
    } catch (error) {
      console.error('Error associating token with account:', error);
      return false;
    }
  };
  
  // Transfer tokens between accounts
  export const transferTokens = async (
    client: Client,
    tokenId: string,
    senderAccountId: string,
    receiverAccountId: string,
    amount: number
  ): Promise<string | null> => {
    try {
      const transaction = await new TokenTransferTransaction()
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(senderAccountId), -amount)
        .addTokenTransfer(TokenId.fromString(tokenId), AccountId.fromString(receiverAccountId), amount)
        .freezeWith(client)
        .sign(PrivateKey.fromString(client.operatorAccountId?.toString() || ''));
      
      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);
      
      return response.transactionId.toString();
    } catch (error) {
      console.error('Error transferring tokens:', error);
      return null;
    }
  };
  
  // Transfer HBAR between accounts
  export const transferHBAR = async (
    client: Client,
    receiverAccountId: string,
    amount: number // in HBAR
  ): Promise<string | null> => {
    try {
      const transaction = await new TransferTransaction()
        .addHbarTransfer(client.operatorAccountId as AccountId, Hbar.fromTinybars(-amount * 100_000_000))
        .addHbarTransfer(AccountId.fromString(receiverAccountId), Hbar.fromTinybars(amount * 100_000_000))
        .freezeWith(client)
        .sign(PrivateKey.fromString(client.operatorAccountId?.toString() || ''));
      
      const response = await transaction.execute(client);
      const receipt = await response.getReceipt(client);
      
      return response.transactionId.toString();
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      return null;
    }
  };
  
  // Check if an account exists
  export const accountExists = async (
    client: Client,
    accountId: string
  ): Promise<boolean> => {
    try {
      const account = await new AccountId(accountId).getAccount(client);
      return account !== null;
    } catch (error) {
      return false;
    }
  };
  
  // Check if an account is associated with a token
  export const isTokenAssociated = async (
    client: Client,
    accountId: string,
    tokenId: string
  ): Promise<boolean> => {
    try {
      // This is a simplified check. In a real implementation, you would query the account's associated tokens
      return true;
    } catch (error) {
      return false;
    }
  };
  
  // Get transaction details from transaction ID
  export const getTransactionDetails = async (
    client: Client,
    transactionId: string
  ): Promise<any | null> => {
    try {
      // In a real implementation, you would use Mirror Node API to get transaction details
      return { status: 'SUCCESS' };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  };
  
  // Get token info
  export const getTokenInfo = async (
    client: Client,
    tokenId: string
  ): Promise<any | null> => {
    try {
      // In a real implementation, you would query token info using the SDK or Mirror Node API
      return {
        tokenId,
        name: 'Carbon Credit',
        symbol: 'CRX',
        decimals: 2,
        totalSupply: 1000,
        maxSupply: 10000
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      return null;
    }
  };
  
  // Format transaction ID for explorer link
  export const getExplorerLink = (transactionId: string, network: 'mainnet' | 'testnet' = NETWORK_TYPE): string => {
    const baseUrl = network === 'mainnet' 
      ? 'https://hashscan.io/mainnet/transaction/' 
      : 'https://hashscan.io/testnet/transaction/';
    
    // Remove the @seconds.nanos part if present
    const cleanedId = transactionId.split('@')[0];
    return `${baseUrl}${cleanedId}`;
  };
  
  // Check balance of an account
  export const getAccountBalance = async (client: Client, accountId: string): Promise<number> => {
    try {
      const balance = await new AccountId(accountId).getBalance(client);
      return balance.hbars.toTinybars().toNumber() / 100_000_000;
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  };
  
  // Check token balance of an account
  export const getTokenBalance = async (
    client: Client,
    accountId: string,
    tokenId: string
  ): Promise<number> => {
    try {
      // In a real implementation, you would query token balance using the SDK or Mirror Node API
      return 0;
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  };