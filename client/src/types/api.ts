// API Response types

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    pages: number;
    page: number;
    limit: number;
  }
  
  export interface ErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    stack?: string;
  }
  
  // Auth Response types
  export interface AuthResponse {
    user: UserDto;
    token: string;
  }
  
  // User types
  export interface UserDto {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'verifier';
    walletId?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Filter and pagination types
  export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
  
  export interface FilterOptions extends PaginationOptions {
    search?: string;
    status?: string;
    projectType?: string;
    verified?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }