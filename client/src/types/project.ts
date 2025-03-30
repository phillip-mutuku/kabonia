import { Coordinates, FileInfo } from './index';

// Project status enum
export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  COMPLETED = 'completed'
}

export interface VerificationHistoryRecord {
  date: Date;
  status: string;
  notes?: string;
  verifier?: string;
}

// Project type enum
export enum ProjectType {
  REFORESTATION = 'Reforestation',
  SOLAR = 'Solar',
  WIND = 'Wind',
  CONSERVATION = 'Conservation',
  METHANE_CAPTURE = 'Methane Capture',
  ENERGY_EFFICIENCY = 'Energy Efficiency',
  BIOMASS = 'Biomass'
}

// Verification status enum
export enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Project interface
export interface Project {
  _id: string;
  name: string;
  description: string;
  location: string;
  area: number;
  coordinates?: Coordinates;
  projectType: ProjectType;
  status: ProjectStatus;
  owner: string;
  ownerName?: string;
  startDate?: string;
  endDate?: string;
  images?: string[];
  documents?: FileInfo[];
  carbonCredits?: number;
  price?: number;
  verificationStatus?: VerificationStatus;
  estimatedCarbonCapture?: number;
  actualCarbonCapture?: number;
  createdAt: string;
  updatedAt: string;
  verificationHistory?: VerificationHistoryRecord[];
}

// Project creation input type
export interface CreateProjectInput {
  name: string;
  description: string;
  location: string;
  area: number;
  projectType: ProjectType;
  coordinates?: Coordinates;
  startDate?: string;
  endDate?: string;
  images?: File[];
  documents?: File[];
}

// Project update input type
export interface UpdateProjectInput {
  name?: string;
  description?: string;
  location?: string;
  area?: number;
  projectType?: ProjectType;
  coordinates?: Coordinates;
  startDate?: string;
  endDate?: string;
  images?: File[];
  documents?: File[];
  status?: ProjectStatus;
  price?: number;
  carbonCredits?: number;
  verificationStatus?: VerificationStatus;
}

// Project filter options
export interface ProjectQueryOptions {
  search?: string;
  status?: ProjectStatus;
  projectType?: ProjectType;
  verified?: boolean;
  location?: string;
  owner?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Project stats
export interface ProjectStats {
  totalProjects: number;
  verifiedProjects: number;
  totalArea: number;
  totalCarbonCredits: number;
  projectsByType: Record<string, number>;
}

// Project valuation
export interface ProjectValuation {
  estimatedValue: number;
  carbonCreditPrice: number;
  potentialRevenue: number;
}