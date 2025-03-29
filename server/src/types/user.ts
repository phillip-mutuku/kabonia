import { Types } from 'mongoose';

// User role enum
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  VERIFIER = 'verifier'
}

// User document interface
export interface User {
  _id?: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  walletId?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// User registration input
export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  walletId?: string;
}

// User login input
export interface LoginUserInput {
  email: string;
  password: string;
}

// Update profile input
export interface UpdateProfileInput {
  name?: string;
  email?: string;
  walletId?: string;
}

// Change password input
export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// Connect wallet input
export interface ConnectWalletInput {
  walletId: string;
}

// User response (without password)
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  walletId?: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Authentication response
export interface AuthResponse {
  token: string;
  user: UserResponse;
}