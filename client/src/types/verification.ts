// types/verification.ts

export interface Verification {
    _id: string;
    projectId: string;
    requesterId: string;
    reviewerId?: string;
    status: 'pending' | 'in_progress' | 'approved' | 'rejected';
    submissionDate: string;
    completionDate?: string;
    data?: VerificationData;
    results?: VerificationResults;
    notes?: string;
    documents?: string[];
    satelliteImages?: SatelliteImage[];
  }
  
  export interface VerificationData {
    area?: number;
    methodology?: string;
    carbonOffset?: number;
    documents?: string[];
    additionalInfo?: Record<string, any>;
  }
  
  export interface VerificationResults {
    verifiedArea?: number;
    sequestrationRate?: number;
    totalOffset?: number;
    comments?: string;
  }
  
  export interface SatelliteImage {
    url: string;
    date: string;
    description?: string;
    type?: string;
  }
  
  export interface StartVerificationInput {
    projectId: string;
    requesterId: string;
    documents?: string[];
    notes?: string;
  }
  
  export interface SubmitVerificationDataInput {
    verificationId: string;
    userId: string;
    data: VerificationData;
    documents?: File[];
    additionalInfo?: string;
  }
  
  export interface UpdateVerificationStatusInput {
    verificationId: string;
    reviewerId: string;
    status: 'approved' | 'rejected';
    results?: VerificationResults;
    notes?: string;
  }