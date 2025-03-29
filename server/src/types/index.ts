// Export all types
export * from './project';
export * from './token';
export * from './verification';
export * from './market';
export * from './user';

// Common types

// Pagination params
export interface PaginationOptions {
  page?: number;
  limit?: number;
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// Geolocation
export interface GeoLocation {
  type: string;
  coordinates: [number, number];
}

// Boundary
export interface Boundary {
  type: string;
  coordinates: [number, number][];
}