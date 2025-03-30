import mongoose, { Document, Schema } from 'mongoose';

export interface IListing extends Document {
  tokenId: string;
  projectId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  amount: number;
  remaining: number;
  price: number; // Price per token
  expirationDate: Date;
  active: boolean;
  transactionId?: string;
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