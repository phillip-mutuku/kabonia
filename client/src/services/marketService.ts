import api from './api';
import { 
  Listing, 
  Transaction, 
  CreateListingInput, 
  ExecutePurchaseInput, 
  MarketSummary,
  PriceHistoryItem,
  PriceRecommendation
} from '@/types/market';

export const marketService = {
  /**
   * Create a new listing
   */
  createListing: async (listingData: CreateListingInput): Promise<Listing> => {
    const response = await api.post<{ success: boolean; data: Listing }>('/market/listings', listingData);
    return response.data.data;
  },

  /**
   * Get all active listings with optional filtering
   */
  getListings: async (options: { 
    page?: number; 
    limit?: number; 
    tokenId?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
  } = {}): Promise<{ data: Listing[]; count: number }> => {
    const { page, limit, tokenId, minPrice, maxPrice, sellerId } = options;
    const response = await api.get<{ success: boolean; data: Listing[]; count: number }>('/market/listings', {
      params: { page, limit, tokenId, minPrice, maxPrice, sellerId }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },


/**
 * Execute a purchase transaction
 */
executePurchase: async (purchaseData: ExecutePurchaseInput): Promise<{
  transaction: Transaction;
  listing: { id: string; tokenId: string; remaining: number; active: boolean };
}> => {
  try {
    if (!purchaseData.listingId) {
      throw new Error('Missing listing ID');
    }
    
    // Format data with proper types
    const formattedData = {
      listingId: String(purchaseData.listingId),
      amount: Number(purchaseData.amount)
    };
    
    console.log('Sending purchase request to API:', formattedData);
    
    const response = await api.post<{
      success: boolean;
      data: {
        transaction: Transaction;
        listing: { id: string; tokenId: string; remaining: number; active: boolean };
      }
    }>('/market/purchase', formattedData);
    
    console.log('Purchase API response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error in executePurchase:', error);
    
    // Extract the most useful error information
    const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         error.message || 
                         'Failed to execute purchase';
    
    throw new Error(errorMessage);
  }
},

  /**
   * Cancel a listing
   */
  cancelListing: async (listingId: string): Promise<void> => {
    await api.delete<{ success: boolean; data: {} }>(`/market/listings/${listingId}`);
  },

  /**
   * Get transaction history
   */
  getTransactionHistory: async (options: {
    page?: number;
    limit?: number;
    userId?: string;
    tokenId?: string;
    projectId?: string;
    type?: string;
  } = {}): Promise<{ data: Transaction[]; count: number }> => {
    const { page, limit, userId, tokenId, projectId, type } = options;
    const response = await api.get<{ success: boolean; data: Transaction[]; count: number }>('/market/transactions', {
      params: { page, limit, userId, tokenId, projectId, type }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get listings created by the current user
   */
  getUserListings: async (active?: boolean): Promise<{ data: Listing[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Listing[]; count: number }>('/market/listings/me', {
      params: { active }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get market summary statistics
   */
  getMarketSummary: async (): Promise<MarketSummary> => {
    const response = await api.get<{ success: boolean; data: MarketSummary }>('/market/summary');
    return response.data.data;
  },

  /**
   * Get price history for a token
   */
  getPriceHistory: async (tokenId: string, days: number = 30): Promise<PriceHistoryItem[]> => {
    const response = await api.get<{ success: boolean; data: PriceHistoryItem[] }>(`/market/price-history/${tokenId}`, {
      params: { days }
    });
    return response.data.data;
  },

  /**
   * Get price recommendation for a new token
   */
  getPriceRecommendation: async (projectId: string): Promise<PriceRecommendation> => {
    const response = await api.get<{ success: boolean; data: PriceRecommendation }>(
      `/market/price-recommendation/${projectId}`
    );
    return response.data.data;
  }
};