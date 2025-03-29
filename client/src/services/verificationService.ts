import api from './api';
import {
  Verification,
  StartVerificationInput,
  SubmitVerificationDataInput,
  UpdateVerificationStatusInput,
  SatelliteImage
} from '@/types/verification';

export const verificationService = {
  /**
   * Start a new verification process
   */
  startVerification: async (verificationData: Omit<StartVerificationInput, 'requesterId'>): Promise<Verification> => {
    const response = await api.post<{ success: boolean; data: Verification }>('/verification', verificationData);
    return response.data.data;
  },

  /**
   * Get all verifications with optional filtering
   */
  getVerifications: async (options: {
    page?: number;
    limit?: number;
    projectId?: string;
    status?: string;
    requesterId?: string;
    reviewerId?: string;
  } = {}): Promise<{ data: Verification[]; count: number }> => {
    const { page, limit, projectId, status, requesterId, reviewerId } = options;
    const response = await api.get<{ success: boolean; data: Verification[]; count: number }>('/verification', {
      params: { page, limit, projectId, status, requesterId, reviewerId }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get verifications requested by the current user
   */
  getMyVerifications: async (): Promise<{ data: Verification[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Verification[]; count: number }>('/verification/me');
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get pending verifications (for verifiers)
   */
  getPendingVerifications: async (): Promise<{ data: Verification[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Verification[]; count: number }>('/verification/pending');
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get verifications for a specific project
   */
  getProjectVerifications: async (projectId: string): Promise<{ data: Verification[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Verification[]; count: number }>(
      `/verification/project/${projectId}`
    );
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get a single verification for a project (convenience method)
   * Returns the most recent verification or null if none exists
   */
  getProjectVerification: async (projectId: string): Promise<Verification | null> => {
    try {
      const response = await api.get<{ success: boolean; data: Verification[]; count: number }>(
        `/verification/project/${projectId}`
      );
      
      if (response.data.data && response.data.data.length > 0) {
        // Return the most recent verification
        return response.data.data[0];
      }
      return null;
    } catch (error) {
      console.error('Error fetching project verification:', error);
      return null;
    }
  },

  /**
   * Get a verification by ID
   */
  getVerificationById: async (verificationId: string): Promise<Verification> => {
    const response = await api.get<{ success: boolean; data: Verification }>(`/verification/${verificationId}`);
    return response.data.data;
  },

/**
 * Submit verification data
 */
submitVerificationData: async (
  verificationId: string,
  data: {
    documents?: File[] | FormData;
    additionalInfo?: string;
  }
): Promise<Verification> => {
  let headers: Record<string, string> = {};
  
  if (data.documents instanceof FormData) {
    // If documents is already FormData, use it directly
    const formData = data.documents;
    if (data.additionalInfo) {
      formData.append('additionalInfo', data.additionalInfo);
    }
    
    const response = await api.post<{ success: boolean; data: Verification }>(
      `/verification/${verificationId}/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } else if (Array.isArray(data.documents)) {
    // Create FormData from File array
    const formData = new FormData();
    data.documents.forEach((file) => {
      formData.append('documents', file);
    });
    
    if (data.additionalInfo) {
      formData.append('additionalInfo', data.additionalInfo);
    }
    
    const response = await api.post<{ success: boolean; data: Verification }>(
      `/verification/${verificationId}/submit`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } else {
    // Just send JSON
    const jsonData = { additionalInfo: data.additionalInfo };
    
    const response = await api.post<{ success: boolean; data: Verification }>(
      `/verification/${verificationId}/submit`,
      jsonData,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data.data;
  }
},

  /**
   * Submit both project verification and verification data in one call
   * This helps simplify the verification process flow
   */
  submitProjectForVerification: async (
    projectId: string, 
    verificationData?: {
      documents?: File[];
      additionalInfo?: string;
    }
  ): Promise<Verification | null> => {
    try {
      // First, create a verification request for the project
      const startResponse = await api.post<{ success: boolean; data: Verification }>(
        `/projects/${projectId}/submit-verification`
      );
      
      const verification = startResponse.data.data;
      
      // If we have verification data to submit, do it in a second step
      if (verificationData && verification && verification._id) {
        const formData: FormData = new FormData();
        
        if (verificationData.documents && verificationData.documents.length > 0) {
          verificationData.documents.forEach(file => {
            formData.append('documents', file);
          });
        }
        
        if (verificationData.additionalInfo) {
          formData.append('additionalInfo', verificationData.additionalInfo);
        }
        
        const dataResponse = await api.post<{ success: boolean; data: Verification }>(
          `/verification/${verification._id}/submit`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        return dataResponse.data.data;
      }
      
      return verification;
    } catch (error) {
      console.error('Error submitting project for verification:', error);
      throw error;
    }
  },

  /**
   * Update verification status
   */
  updateVerificationStatus: async (
    verificationId: string,
    data: Omit<UpdateVerificationStatusInput, 'verificationId' | 'reviewerId'>
  ): Promise<Verification> => {
    const response = await api.put<{ success: boolean; data: Verification }>(
      `/verification/${verificationId}/status`,
      data
    );
    return response.data.data;
  },
    
  /**
   * Get satellite images for a verification
   * (Added to support SatelliteView component)
   */
  getSatelliteImages: async (verificationId: string): Promise<SatelliteImage[]> => {
    try {
      const verification = await verificationService.getVerificationById(verificationId);
      return verification.satelliteImages || [];
    } catch (error) {
      console.error('Error fetching satellite images:', error);
      return [];
    }
  }
};