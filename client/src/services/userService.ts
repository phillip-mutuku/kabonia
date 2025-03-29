import api from './api';
import { 
  AuthResponse, 
  RegisterUserInput, 
  LoginUserInput, 
  UpdateProfileInput, 
  UserResponse,
  ChangePasswordInput,
} from '@/types/user';

export const userService = {
  /**
   * Register a new user
   */
  register: async (userData: RegisterUserInput): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; token: string; user: UserResponse }>('/users/register', userData);
    return response.data;
  },

  /**
   * Login user
   */
  login: async (credentials: LoginUserInput): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; token: string; user: UserResponse }>('/users/login', credentials);
    return response.data;
  },

  /**
   * Get current user profile
   */
  getProfile: async (): Promise<UserResponse> => {
    const response = await api.get<{ success: boolean; data: UserResponse }>('/users/me');
    return response.data.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData: UpdateProfileInput): Promise<UserResponse> => {
    const response = await api.put<{ success: boolean; data: UserResponse }>('/users/me', profileData);
    return response.data.data;
  },

  /**
   * Change password
   */
  changePassword: async (passwordData: ChangePasswordInput): Promise<{ message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/users/change-password', passwordData);
    return response.data;
  },

  /**
   * Connect wallet
   */
  connectWallet: async (walletId: string): Promise<UserResponse> => {
    const response = await api.post<{ success: boolean; data: UserResponse }>('/users/connect-wallet', { walletId });
    return response.data.data;
  },

  /**
   * Get user by ID (admin only)
   */
  getUserById: async (userId: string): Promise<UserResponse> => {
    const response = await api.get<{ success: boolean; data: UserResponse }>(`/users/${userId}`);
    return response.data.data;
  },

  /**
   * Update user role (admin only)
   */
  updateUserRole: async (userId: string, role: string): Promise<UserResponse> => {
    const response = await api.put<{ success: boolean; data: UserResponse }>(`/users/${userId}/role`, { role });
    return response.data.data;
  }
};