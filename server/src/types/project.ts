import { GeoLocation, Boundary, PaginationOptions } from './index';
import { Types } from 'mongoose';

// Project status enum
export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

// Project type enum
export enum ProjectType {
  REFORESTATION = 'reforestation',
  CONSERVATION = 'conservation',
  RENEWABLE_ENERGY = 'renewable_energy',
  METHANE_CAPTURE = 'methane_capture',
  SOIL_CARBON = 'soil_carbon',
  OTHER = 'other'
}

// Verification history record
export interface VerificationHistoryRecord {
  date: Date;
  status: string;
  notes?: string;
  verifier?: Types.ObjectId;
}

// Project document interface
export interface Project {
  _id?: Types.ObjectId;
  name: string;
  description: string;
  location: string;
  coordinates: GeoLocation;
  boundary?: Boundary;
  area: number; // In hectares
  estimatedCarbonCapture: number; // In tons of CO2
  actualCarbonCapture?: number; // Updated after verification
  startDate: Date;
  endDate: Date;
  projectType: string;
  status: string;
  owner: Types.ObjectId;
  images?: string[];
  documents?: string[]; 
  topicId?: string; 
  tokenId?: string;
  verificationHistory: VerificationHistoryRecord[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Create project input
export interface CreateProjectInput {
  name: string;
  description: string;
  location: string;
  coordinates: GeoLocation;
  boundary?: Boundary;
  area: number;
  estimatedCarbonCapture: number;
  startDate: Date;
  endDate: Date;
  projectType: string;
  images?: string[];
  documents?: string[];
}

// Update project input
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  location?: string;
  coordinates?: GeoLocation;
  boundary?: Boundary;
  area?: number;
  estimatedCarbonCapture?: number;
  startDate?: Date;
  endDate?: Date;
  projectType?: string;
  images?: string[];
  documents?: string[];
}

// Project query options
export interface ProjectQueryOptions extends PaginationOptions {
  status?: string;
  location?: string;
  owner?: string;
  projectType?: string;
}

// Project valuation data
export interface ProjectValuation {
  creditValue: number;
  confidence: number;
  marketTrend: string;
  factors: {
    [key: string]: string;
  };
  recommendedInitialPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}