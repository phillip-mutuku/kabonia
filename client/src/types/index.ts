export * from './api';
export * from './project';
export * from './token';

// Hedera specific types
export type NetworkType = 'mainnet' | 'testnet';

export interface HederaAccount {
  accountId: string;
  privateKey?: string;
  publicKey?: string;
  network: NetworkType;
}

export interface HashConnectData {
  topic: string;
  pairingString: string;
  privateKey: string;
  pairedWalletData?: {
    accountIds: string[];
    network: NetworkType;
    topic: string;
  };
  pairedAccounts: string[];
}

// Dashboard widget types
export interface WidgetProps {
  title: string;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

// Form related types
export interface SelectOption {
  value: string;
  label: string;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
  title?: string;
  autoClose?: boolean;
  timestamp: number;
}

export interface FileInfo {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface Coordinates {
  lat?: number;
  lng?: number;
  latitude?: number;
  longitude?: number;
  type?: string;
  coordinates?: [number, number];
}

// Generic query options
export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Normalizes various coordinate formats to a standard {lat, lng} object
 * Handles:
 * - Standard lat/lng object
 * - latitude/longitude object
 * - GeoJSON Point format
 * - String values (converts to numbers)
 */
export function normalizeCoordinates(coords?: any): { lat: number; lng: number } {
  if (!coords) {
    return { lat: 0, lng: 0 };
  }
  
  // Debug the incoming coordinates format
  console.log('Normalizing coordinates format:', coords);
  
  // Case 1: GeoJSON Point format
  if (coords.type === 'Point' && Array.isArray(coords.coordinates) && coords.coordinates.length === 2) {
    return {
      // GeoJSON stores as [longitude, latitude]
      lng: coords.coordinates[0],
      lat: coords.coordinates[1]
    };
  }
  
  // Case 2: Standard lat/lng format (handles both number and string types)
  if (coords.lat !== undefined || coords.lng !== undefined || coords.latitude !== undefined || coords.longitude !== undefined) {
    const lat = coords.lat !== undefined ? parseFloat(String(coords.lat)) : 
              (coords.latitude !== undefined ? parseFloat(String(coords.latitude)) : 0);
              
    const lng = coords.lng !== undefined ? parseFloat(String(coords.lng)) : 
              (coords.longitude !== undefined ? parseFloat(String(coords.longitude)) : 0);
    
    return {
      lat: isNaN(lat) ? 0 : lat,
      lng: isNaN(lng) ? 0 : lng
    };
  }
  
  // Case 3: Raw array format [longitude, latitude]
  if (Array.isArray(coords) && coords.length === 2) {
    return {
      lng: parseFloat(String(coords[0])),
      lat: parseFloat(String(coords[1]))
    };
  }
  
  // Case 4: Handle MongoDB GeoJSON (stored differently)
  if (Array.isArray(coords.coordinates) && coords.coordinates.length === 2) {
    return {
      lng: coords.coordinates[0],
      lat: coords.coordinates[1]
    };
  }
  
  // Default fallback
  console.warn('Could not normalize coordinates:', coords);
  return { lat: 0, lng: 0 };
}