import { Types } from 'mongoose';
import { PaginationOptions } from './index';

// Verification status enum
export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

// Verification type enum
export enum VerificationType {
  SATELLITE = 'satellite_imagery',
  FIELD_VISIT = 'field_visit',
  DRONE = 'drone_survey',
  DOCUMENTATION = 'documentation_review',
  THIRD_PARTY = 'third_party_audit'
}

// Verification document interface
export interface Verification {
  _id?: Types.ObjectId;
  projectId: Types.ObjectId;
  requesterId: Types.ObjectId;
  verificationType: string;
  status: string;
  data?: {
    [key: string]: any;
  };
  evidence?: string[];
  reviewerId?: Types.ObjectId;
  notes?: string;
  carbonCaptureVerified?: number;
  transactionId?: string;
  startDate: Date;
  completionDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Start verification input
export interface StartVerificationInput {
  projectId: string;
  requesterId: string;
  verificationType: string;
}

// Submit verification data input
export interface SubmitVerificationDataInput {
  verificationId: string;
  userId: string;
  data: {
    [key: string]: any;
  };
  evidence: string[];
}

// Update verification status input
export interface UpdateVerificationStatusInput {
  verificationId: string;
  reviewerId: string;
  status: string;
  notes?: string;
  carbonCaptureVerified?: number;
}

// Verification query options
export interface VerificationQueryOptions extends PaginationOptions {
  projectId?: string;
  status?: string;
  requesterId?: string;
  reviewerId?: string;
}