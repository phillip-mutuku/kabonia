// Market-related type definitions

export interface Listing {
  _id?: string;
  tokenId: string;
  name: string;
  projectId: string;
  projectName: string;
  amount: number;
  price: number;
  carbonOffset: number;
  seller: string;
  createdAt: string;
  image?: string;
  projectType: string;
  location: string;
  verified: boolean;
  remaining?: number;
  active?: boolean;
}

export interface Transaction {
  _id: string;
  tokenId: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  buyer: string;
  seller: string;
  timestamp: string;
  projectName?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface CreateListingInput {
  tokenId: string;
  amount: number;
  price: number;
  expirationDate: Date;
}

export interface ExecutePurchaseInput {
  listingId: string;
  amount: number;
}

export interface MarketSummary {
  totalVolume: number;
  activeTrades: number;
  avgPrice: number;
  priceChange24h: number;
  volumeChange24h: number;
  topProjectTypes: Array<{
    type: string;
    volume: number;
    avgPrice: number;
  }>;
}

export interface PriceHistoryItem {
  date: string;
  price: number;
  volume?: number;
}

export interface PriceRecommendation {
  min: number;
  max: number;
  average: number;
  recommended: number;
  confidence: 'high' | 'medium' | 'low';
}

// Additional type for market stats used in dashboard
export interface MarketStat {
  name: string;
  value: string;
  trend: 'up' | 'down';
  change: string;
}