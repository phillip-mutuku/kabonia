// API Endpoints
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Hedera Network Configuration
export const NETWORK_TYPE = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') as 'mainnet' | 'testnet';
export const HEDERA_MIRROR_NODE_URL = NETWORK_TYPE === 'mainnet' 
  ? 'https://mainnet-public.mirrornode.hedera.com'
  : 'https://testnet.mirrornode.hedera.com';

// App metadata for HashConnect
export const APP_METADATA = {
  name: 'CarbonX',
  description: 'Carbon Credit Marketplace on Hedera',
  icon: '/logo.png',
  url: typeof window !== 'undefined' ? window.location.origin : '',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  HASHCONNECT_DATA: 'hashconnectData',
  THEME: 'theme',
  NOTIFICATIONS: 'notifications',
};

// Project Types with colors
export const PROJECT_TYPES = [
  { value: 'Reforestation', label: 'Reforestation', color: '#056835' },
  { value: 'Solar', label: 'Solar', color: '#FFB30F' },
  { value: 'Wind', label: 'Wind', color: '#64A8DD' },
  { value: 'Conservation', label: 'Conservation', color: '#800020' },
  { value: 'Methane Capture', label: 'Methane Capture', color: '#BF800F' },
  { value: 'Energy Efficiency', label: 'Energy Efficiency', color: '#6B8E23' },
  { value: 'Biomass', label: 'Biomass', color: '#8B4513' },
];

// Project Statuses with colors
export const PROJECT_STATUSES = [
  { value: 'Pending', label: 'Pending', color: '#f59e0b' },
  { value: 'Active', label: 'Active', color: '#10b981' },
  { value: 'Completed', label: 'Completed', color: '#3b82f6' },
  { value: 'Rejected', label: 'Rejected', color: '#ef4444' },
];

// Verification Statuses with colors
export const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'approved', label: 'Approved', color: '#10b981' },
  { value: 'verified', label: 'Verified', color: '#10b981' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' },
];

// Application Theme Colors
export const THEME_COLORS = {
  primary: {
    50: '#F9F6F7',
    100: '#F3EDEF',
    200: '#E0D3D7',
    300: '#CDB9BF',
    400: '#A6848F',
    500: '#80505F',
    600: '#734855',
    700: '#4D3038',
    800: '#3A242A',
    900: '#27181D',
  },
  secondary: {
    50: '#FEFBF5',
    100: '#FDF7EB',
    200: '#FBEACC',
    300: '#F9DEAD',
    400: '#F4C36F',
    500: '#EFA831',
    600: '#D7972C',
    700: '#8F651D',
    800: '#6C4C16',
    900: '#48320F',
  },
};

// Carbon Impact Equivalents
export const CARBON_EQUIVALENTS = {
  TREES_PER_TON: 1.2, // Trees planted per ton of CO2
  MILES_PER_TON: 2404, // Miles not driven per ton of CO2
  HOMES_PER_TON: 0.12, // Homes powered for a year per ton of CO2
};

// Error Messages
export const ERROR_MESSAGES = {
  DEFAULT: 'Something went wrong. Please try again.',
  CONNECTION: 'Could not connect to the server. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  WALLET_CONNECTION: 'Could not connect to your wallet. Please make sure your wallet extension is installed and unlocked.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully!',
  PROJECT_UPDATED: 'Project updated successfully!',
  TOKEN_MINTED: 'Carbon credits minted successfully!',
  TOKEN_TRANSFERRED: 'Carbon credits transferred successfully!',
  TOKEN_RETIRED: 'Carbon credits retired successfully!',
  TOKEN_LISTED: 'Carbon credits listed for sale successfully!',
  TOKEN_PURCHASED: 'Carbon credits purchased successfully!',
  VERIFICATION_SUBMITTED: 'Project submitted for verification successfully!',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 20, 50, 100],
};

// Dashboard metrics
export const DASHBOARD_METRICS = {
  CARBON_GOAL: 10, // Default carbon offset goal in tons
  TRENDING_DAYS: 30, // Days to consider for trending data
};

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ACCEPTED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

// Hedera token configuration
export const HEDERA_TOKEN_CONFIG = {
  TOKEN_NAME: 'CarbonX Credit',
  TOKEN_SYMBOL: 'CRX',
  DECIMALS: 2,
  INITIAL_SUPPLY: 0,
  MAX_SUPPLY: 1000000000,
  MEMO: 'Carbon Credit Token for CarbonX Platform',
};

// Routes configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  MARKETPLACE: '/marketplace',
  PORTFOLIO: '/portfolio',
  VERIFICATION: '/verification',
};

// External URLs
export const EXTERNAL_URLS = {
  HEDERA_EXPLORER: 'https://hashscan.io',
  HASHPACK_WALLET: 'https://www.hashpack.app/',
  DOCUMENTATION: 'https://docs.carbonx.com',
  SUPPORT: 'https://support.carbonx.com',
};