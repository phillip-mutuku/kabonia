import mongoose, { Document, Schema } from 'mongoose';
import { constants } from '../config/constants';

export interface IVerification extends Document {
  projectId: mongoose.Types.ObjectId; // Associated project
  requesterId: mongoose.Types.ObjectId; // User who requested verification
  verificationType: string; // Type of verification (e.g., satellite, field-visit, drone)
  status: string; // pending, in_progress, approved, rejected
  data?: {
    [key: string]: any; // Flexible data structure for verification results
  };
  evidence?: string[]; // URLs to evidence documents/images
  reviewerId?: mongoose.Types.ObjectId; // User who reviewed the verification
  notes?: string; // Notes from reviewer
  carbonCaptureVerified?: number; // Verified carbon capture amount
  transactionId?: string; // Hedera transaction ID for recording on ledger
  startDate: Date;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    verificationType: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(constants.VERIFICATION_STATUS),
      default: constants.VERIFICATION_STATUS.PENDING
    },
    data: {
      type: Schema.Types.Mixed
    },
    evidence: [String], // URLs to evidence documents/images
    reviewerId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String
    },
    carbonCaptureVerified: {
      type: Number,
      min: 0
    },
    transactionId: {
      type: String
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    completionDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);