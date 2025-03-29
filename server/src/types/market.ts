const mongoose = require('mongoose');
import { PaginationOptions } from './index';

// Transaction types enum
export enum TransactionType {
  MINT = 'mint',
  TRANSFER = 'transfer',
  BUY = 'buy',
  SELL = 'sell'
}

// Transaction status enum
export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

// Listing document interface
export interface Listing {
  _id?: Types.ObjectId;
  tokenId: string;
  projectId: Types.ObjectId;
  sellerId: Types.ObjectId;
  amount: number;
  remaining: number;
  price: number;
  expirationDate: Date;
  active: boolean;
  transactionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Transaction document interface
export interface Transaction {
  _id?: Types.ObjectId;
  transactionId: string;
  tokenId: string;
  projectId: Types.ObjectId;
  type: string;
  sender?: Types.ObjectId;
  receiver: Types.ObjectId;
  amount: number;
  price?: number;
  totalPrice?: number;
  status: string;
  memo?: string;
  consensusTimestamp?: Date;
  listingId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Create listing input
export interface CreateListingInput {
  tokenId: string;
  sellerId: string;
  amount: number;
  price: number;
  expirationDate: Date;
}

// Execute purchase input
export interface ExecutePurchaseInput {
  listingId: string;
  buyerId: string;
  amount: number;
}

// Listing query options
export interface ListingQueryOptions extends PaginationOptions {
  tokenId?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  active?: boolean;
}

// Transaction query options
export interface TransactionQueryOptions extends PaginationOptions {
  userId?: string;
  tokenId?: string;
  projectId?: string;
  type?: string;
}

// Market summary
export interface MarketSummary {
  averagePrice: number;
  activeListingsCount: number;
  totalVolumeTraded: number;
  totalValueTraded: number;
  recentTransactions: Transaction[];
}

// Price history item
export interface PriceHistoryItem {
  date: string;
  price: number;
}

// Price recommendation
export interface PriceRecommendation {
  recommendedPrice: number;
  aiPrediction: number;
  marketAverage: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketTrend: string;
  factors: {
    [key: string]: string;
  };
}