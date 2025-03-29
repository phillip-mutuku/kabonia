import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  tokenId: string; // Hedera token ID
  projectId: mongoose.Types.ObjectId; // Associated project
  sellerId: mongoose.Types.ObjectId; // User who listed the tokens
  amount: number; // Amount of tokens for sale
  remaining: number; // Remaining amount after partial purchases
  price: number; // Price per token
  expirationDate: Date;
  active: boolean; // Whether the listing is active
  transactionId?: string; // Transaction ID when listing is completed
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema(
  {
    tokenId: {
      type: String,
      required: true
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    remaining: {
      type: Number,
      required: true,
      min: 0
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    expirationDate: {
      type: Date,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    transactionId: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for listing queries
ListingSchema.index({ tokenId: 1, active: 1 });
ListingSchema.index({ sellerId: 1 });
ListingSchema.index({ projectId: 1 });
ListingSchema.index({ expirationDate: 1 });

export const Listing = mongoose.model<IListing>('Listing', ListingSchema);