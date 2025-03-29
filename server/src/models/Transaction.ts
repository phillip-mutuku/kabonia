import mongoose, { Document, Schema } from 'mongoose';
import { constants } from '../config/constants';

export interface ITransaction extends Document {
  transactionId: string; // Hedera transaction ID
  tokenId: string; // Hedera token ID
  projectId: mongoose.Types.ObjectId; // Associated project
  type: string; // mint, transfer, buy, sell
  sender?: mongoose.Types.ObjectId; // User who sent tokens (null for minting)
  receiver: mongoose.Types.ObjectId; // User who received tokens
  amount: number; // Amount of tokens transferred
  price?: number; // Price per token (for buy/sell transactions)
  totalPrice?: number; // Total price (amount * price)
  status: string; // confirmed, failed, pending
  memo?: string; // Optional transaction memo
  consensusTimestamp?: Date; // Hedera consensus timestamp
  listingId?: mongoose.Types.ObjectId; // Reference to marketplace listing (for buy/sell)
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    tokenId: {
      type: String,
      required: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(constants.TRANSACTION_TYPES),
      required: true
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      min: 0
    },
    totalPrice: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['confirmed', 'failed', 'pending'],
      default: 'pending'
    },
    memo: {
      type: String
    },
    consensusTimestamp: {
      type: Date
    },
    listingId: {
      type: Schema.Types.ObjectId,
      ref: 'Listing'
    }
  },
  {
    timestamps: true
  }
);

// Create index for transaction queries
TransactionSchema.index({ tokenId: 1 });
TransactionSchema.index({ sender: 1 });
TransactionSchema.index({ receiver: 1 });
TransactionSchema.index({ projectId: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);