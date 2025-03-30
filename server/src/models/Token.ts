import mongoose, { Document, Schema } from 'mongoose';

export interface IToken extends Document {
  tokenId: string; // Hedera token ID
  projectId: mongoose.Types.ObjectId;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  initialSupply: number;
  currentSupply: number;
  maxSupply?: number;
  creator: mongoose.Types.ObjectId;
  creationDate: Date;
  lastMintDate?: Date;
  metadata: {
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TokenSchema = new Schema(
  {
    tokenId: {
      type: String,
      required: true,
      unique: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    tokenName: {
      type: String,
      required: true
    },
    tokenSymbol: {
      type: String,
      required: true
    },
    decimals: {
      type: Number,
      required: true,
      default: 2,
      min: 0,
      max: 18
    },
    initialSupply: {
      type: Number,
      required: true,
      min: 1
    },
    currentSupply: {
      type: Number,
      required: true,
      min: 0
    },
    maxSupply: {
      type: Number,
      min: 0
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    creationDate: {
      type: Date,
      default: Date.now
    },
    lastMintDate: {
      type: Date
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

export const Token = mongoose.model<IToken>('Token', TokenSchema);