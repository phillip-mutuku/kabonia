import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Project, 
  CreateProjectInput, 
  UpdateProjectInput, 
  ProjectValuation, 
  ProjectStatus,
  ProjectQueryOptions 
} from '@/types/project';
import { projectService } from '@/services/projectService';


interface ProjectState {
  projects: Project[];
  featuredProjects: Project[];
  userProjects: Project[];
  currentProject: Project | null;
  projectValuation: ProjectValuation | null;
  nearbyProjects: Project[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: ProjectState = {
  projects: [],
  featuredProjects: [],
  userProjects: [],
  currentProject: null,
  projectValuation: null,
  nearbyProjects: [],
  isLoading: false,
  error: null,
  totalCount: 0,
};

// Async thunks
export const getProjects = createAsyncThunk(
  'project/getProjects',
  async (options: ProjectQueryOptions = {}, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjects(options);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/create',
  async (projectData: CreateProjectInput, { rejectWithValue }) => {
    try {
      const response = await projectService.createProject(projectData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create project');
    }
  }
);

export const getProjectById = createAsyncThunk(
  'project/getProjectById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectById(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async (
    { projectId, projectData }: { projectId: string; projectData: UpdateProjectInput },
    { rejectWithValue }
  ) => {
    try {
      const response = await projectService.updateProject(projectId, projectData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update project');
    }
  }
);

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectService.deleteProject(projectId);
      return projectId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to delete project');
    }
  }
);

export const getUserProjects = createAsyncThunk(
  'project/getUserProjects',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching user projects...');
      const response = await projectService.getUserProjects();
      console.log('User projects response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching user projects:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user projects');
    }
  }
);

export const submitForVerification = createAsyncThunk(
  'project/submitForVerification',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.submitForVerification(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to submit for verification');
    }
  }
);

export const updateProjectStatus = createAsyncThunk(
  'project/updateStatus',
  async ({ projectId, status }: { projectId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/test-status/${status}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to update status');
      }
      
      const data = await response.json();
      return data.data;
    } catch (error) {
      return rejectWithValue('Network error occurred');
    }
  }
);

export const getProjectValuation = createAsyncThunk(
  'project/getProjectValuation',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await projectService.getProjectValuation(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get project valuation');
    }
  }
);

export const getNearbyProjects = createAsyncThunk(
  'project/getNearbyProjects',
  async (
    { longitude, latitude, maxDistance }: { longitude: number; latitude: number; maxDistance?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await projectService.getNearbyProjects(longitude, latitude, maxDistance);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch nearby projects');
    }
  }
);

export const uploadProjectDocuments = createAsyncThunk(
  'project/uploadProjectDocuments',
  async (
    { projectId, documentUrls }: { projectId: string; documentUrls: string[] },
    { rejectWithValue }
  ) => {
    try {
      const response = await projectService.uploadProjectDocuments(projectId, documentUrls);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to upload documents');
    }
  }
);

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearProjectError: (state) => {
      state.error = null;
    },
    setFeaturedProjects: (state, action: PayloadAction<Project[]>) => {
      state.featuredProjects = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.userProjects.push(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Projects
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjects.fulfilled, (state, action: PayloadAction<{ data: Project[]; count: number }>) => {
        state.isLoading = false;
        state.projects = action.payload.data;
        state.totalCount = action.payload.count;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Project by ID
      .addCase(getProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      

      .addCase(updateProjectStatus.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.currentProject = action.payload;
        
        // Update in projects list
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        // Update in user projects list
        const userIndex = state.userProjects.findIndex(p => p._id === action.payload._id);
        if (userIndex !== -1) {
          state.userProjects[userIndex] = action.payload;
        }
      })
      
      
      // Update Project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.currentProject = action.payload;
        
        // Update in projects list
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        // Update in user projects list
        const userIndex = state.userProjects.findIndex((p) => p._id === action.payload._id);
        if (userIndex !== -1) {
          state.userProjects[userIndex] = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete Project
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.projects = state.projects.filter((p) => p._id?.toString() !== action.payload);
        state.userProjects = state.userProjects.filter((p) => p._id?.toString() !== action.payload);
        if (state.currentProject && state.currentProject._id?.toString() === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get User Projects
      .addCase(getUserProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProjects.fulfilled, (state, action: PayloadAction<{ data: Project[]; count: number }>) => {
        state.isLoading = false;
        state.userProjects = action.payload.data;
      })
      .addCase(getUserProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Submit for Verification
      .addCase(submitForVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitForVerification.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.currentProject = action.payload;
        
        // Update in projects list
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        // Update in user projects list
        const userIndex = state.userProjects.findIndex((p) => p._id === action.payload._id);
        if (userIndex !== -1) {
          state.userProjects[userIndex] = action.payload;
        }
      })
      .addCase(submitForVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Project Valuation
      .addCase(getProjectValuation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectValuation.fulfilled, (state, action: PayloadAction<ProjectValuation>) => {
        state.isLoading = false;
        state.projectValuation = action.payload;
      })
      .addCase(getProjectValuation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Nearby Projects
      .addCase(getNearbyProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getNearbyProjects.fulfilled, (state, action: PayloadAction<{ data: Project[]; count: number }>) => {
        state.isLoading = false;
        state.nearbyProjects = action.payload.data;
      })
      .addCase(getNearbyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Upload Project Documents
      .addCase(uploadProjectDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(uploadProjectDocuments.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.currentProject = action.payload;
        
        // Update in projects list
        const index = state.projects.findIndex((p) => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        // Update in user projects list
        const userIndex = state.userProjects.findIndex((p) => p._id === action.payload._id);
        if (userIndex !== -1) {
          state.userProjects[userIndex] = action.payload;
        }
      })
      .addCase(uploadProjectDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProject, clearProjectError, setFeaturedProjects } = projectSlice.actions;
export default projectSlice.reducer;
export type { ProjectQueryOptions };