import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthResponse, LoginUserInput, RegisterUserInput, UpdateProfileInput, UserResponse } from '@/types/user';
import { userService } from '@/services/userService';

interface UserState {
  currentUser: UserResponse | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  isAuthenticated: typeof window !== 'undefined' ? !!localStorage.getItem('token') : false,
  isLoading: false,
  error: null,
};

export const checkAuthState = createAsyncThunk(
  'user/checkAuthState',
  async (_, { dispatch, getState }) => {
    const { token } = (getState() as any).user;
    
    if (!token) {
      return null;
    }
    
    try {
      return await dispatch(getProfile()).unwrap();
    } catch (error) {
      return null;
    }
  }
);

// Async thunks
export const register = createAsyncThunk(
  'user/register',
  async (userData: RegisterUserInput, { rejectWithValue }) => {
    try {
      const response = await userService.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'user/login',
  async (credentials: LoginUserInput, { rejectWithValue }) => {
    try {
      const response = await userService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

export const getProfile = createAsyncThunk(
  'user/getProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await userService.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to get profile');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: UpdateProfileInput, { rejectWithValue }) => {
    try {
      const response = await userService.updateProfile(profileData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to update profile');
    }
  }
);

export const connectWallet = createAsyncThunk(
  'user/connectWallet',
  async (walletId: string, { rejectWithValue }) => {
    try {
      const response = await userService.connectWallet(walletId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to connect wallet');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    //isAuthenticated
    .addCase(checkAuthState.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(checkAuthState.fulfilled, (state, action) => {
      state.isLoading = false;
      if (state.currentUser && state.token) {
        state.isAuthenticated = true;
      }
    })
    .addCase(checkAuthState.rejected, (state) => {
      state.isLoading = false;
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.currentUser = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', action.payload.token);
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        if (action.payload === 'Not authorized to access this resource') {
          state.token = null;
          state.isAuthenticated = false;
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
          }
        }
      })
      
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Connect Wallet
      .addCase(connectWallet.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action: PayloadAction<UserResponse>) => {
        state.isLoading = false;
        state.currentUser = action.payload;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = userSlice.actions;
export default userSlice.reducer;