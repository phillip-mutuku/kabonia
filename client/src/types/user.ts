export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: string;
  walletId?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: UserResponse;
}

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ConnectWalletInput {
  walletId: string;
}