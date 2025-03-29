import { Types } from 'mongoose';
import { PaginationOptions } from './index';

// Token document interface
export interface Token {
  _id?: Types.ObjectId;
  tokenId: string; // Hedera token ID
  projectId: Types.ObjectId;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  initialSupply: number;
  currentSupply: number;
  maxSupply?: number;
  creator: Types.ObjectId;
  creationDate: Date;
  lastMintDate?: Date;
  metadata: {
    [key: string]: any;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

// Create token input
export interface CreateTokenInput {
  projectId: string;
  initialSupply: number;
  tokenName: string;
  tokenSymbol: string;
  decimals?: number;
  creatorId: string;
}

// Token transfer input
export interface TokenTransferInput {
  tokenId: string;
  senderId: string;
  receiverId: string;
  amount: number;
}

// Token mint input
export interface TokenMintInput {
  tokenId: string;
  amount: number;
  ownerId: string;
}

// Token query options
export interface TokenQueryOptions extends PaginationOptions {
  projectId?: string;
}

// Token balance
export interface TokenBalance {
  tokenId: string;
  tokenName?: string;
  tokenSymbol?: string;
  projectId?: Types.ObjectId | string;
  balance: number;
}