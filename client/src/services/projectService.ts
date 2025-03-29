import api from './api';
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectQueryOptions, 
  ProjectValuation 
} from '@/types/project';

export const projectService = {
  /**
   * Create a new project
   */
  createProject: async (projectData: CreateProjectInput): Promise<Project> => {
    const response = await api.post<{ success: boolean; data: Project }>('/projects', projectData);
    return response.data.data;
  },

  /**
   * Get all projects with optional filtering
   */
  getProjects: async (options: ProjectQueryOptions = {}): Promise<{ data: Project[]; count: number }> => {
    const { page, limit, status, location, owner, projectType } = options;
    const response = await api.get<{ success: boolean; data: Project[]; count: number }>('/projects', {
      params: { page, limit, status, location, owner, projectType }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get a project by ID
   */
  getProjectById: async (projectId: string): Promise<Project> => {
    const response = await api.get<{ success: boolean; data: Project }>(`/projects/${projectId}`);
    return response.data.data;
  },

  /**
   * Update a project
   */
  updateProject: async (projectId: string, projectData: UpdateProjectInput): Promise<Project> => {
    const response = await api.put<{ success: boolean; data: Project }>(`/projects/${projectId}`, projectData);
    return response.data.data;
  },

  /**
   * Delete a project
   */
  deleteProject: async (projectId: string): Promise<void> => {
    await api.delete<{ success: boolean; data: {} }>(`/projects/${projectId}`);
  },

  /**
   * Get projects created by the current user
   */
  getUserProjects: async (): Promise<{ data: Project[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Project[]; count: number }>('/projects/me');
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Submit a project for verification
   */
  submitForVerification: async (projectId: string, data?: any): Promise<Project> => {
    const response = await api.post<{ success: boolean; data: Project }>(
      `/projects/${projectId}/submit-verification`, 
      data
    );
    return response.data.data;
  },

  /**
   * Get AI-powered valuation for a project
   */
  getProjectValuation: async (projectId: string): Promise<ProjectValuation> => {
    const response = await api.get<{ success: boolean; data: ProjectValuation }>(`/projects/${projectId}/valuation`);
    return response.data.data;
  },

  /**
   * Get projects near a location
   */
  getNearbyProjects: async (longitude: number, latitude: number, maxDistance?: number): Promise<{ data: Project[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Project[]; count: number }>('/projects/nearby', {
      params: { longitude, latitude, maxDistance }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Upload project documents
   */
  uploadProjectDocuments: async (projectId: string, documentUrls: string[]): Promise<Project> => {
    const response = await api.post<{ success: boolean; data: Project }>(`/projects/${projectId}/documents`, {
      documentUrls
    });
    return response.data.data;
  }
};