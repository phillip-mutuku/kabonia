import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Listing, 
  Transaction, 
  CreateListingInput, 
  ExecutePurchaseInput, 
  MarketSummary,
  PriceHistoryItem,
  PriceRecommendation
} from '@/types/market';
import { marketService } from '@/services/marketService';

interface MarketState {
  listings: Listing[];
  userListings: Listing[];
  transactions: Transaction[];
  marketSummary: MarketSummary | null;
  priceHistory: PriceHistoryItem[];
  priceRecommendation: PriceRecommendation | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: MarketState = {
  listings: [],
  userListings: [],
  transactions: [],
  marketSummary: null,
  priceHistory: [],
  priceRecommendation: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

// Async thunks
export const createListing = createAsyncThunk(
  'market/createListing',
  async (listingData: CreateListingInput, { rejectWithValue }) => {
    try {
      const response = await marketService.createListing(listingData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create listing');
    }
  }
);

export const getListings = createAsyncThunk(
  'market/getListings',
  async (options: { 
    page?: number; 
    limit?: number; 
    tokenId?: string;
    minPrice?: number;
    maxPrice?: number;
    sellerId?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await marketService.getListings(options);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch listings');
    }
  }
);

export const executePurchase = createAsyncThunk(
  'market/executePurchase',
  async (purchaseData: ExecutePurchaseInput, { rejectWithValue }) => {
    try {
      // Log the purchase data for debugging
      console.log('Purchase data before API call:', purchaseData);
      
      // Make sure listingId is a string and properly formatted for MongoDB ObjectId
      if (!purchaseData.listingId) {
        console.error('Missing listingId in purchase data');
        return rejectWithValue('Missing listing ID');
      }
      
      // Ensure listingId is a string
      const listingId = String(purchaseData.listingId);
      
      // Check if it's a valid MongoDB ObjectId (24 character hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(listingId);
      if (!isValidObjectId) {
        console.error('Invalid MongoDB ObjectId format:', listingId);
        return rejectWithValue(`Invalid listing ID format: ${listingId}. Must be a 24 character hex string.`);
      }
      
      // Make sure amount is a positive integer
      if (!purchaseData.amount || purchaseData.amount <= 0) {
        console.error('Invalid amount:', purchaseData.amount);
        return rejectWithValue('Amount must be a positive number');
      }
      
      // Create a clean object with the properly formatted data
      const cleanPurchaseData = {
        listingId: listingId,
        amount: purchaseData.amount
      };
      
      console.log('Sending cleaned purchase data to API:', cleanPurchaseData);
      
      const response = await marketService.executePurchase(cleanPurchaseData);
      console.log('Purchase successful. API response:', response);
      return response;
    } catch (error: any) {
      console.error('Purchase failed with error:', error);
      console.error('Error response data:', error.response?.data);
      
      // Provide detailed error message for debugging
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Failed to execute purchase';
                      
      console.error('Error message:', errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const cancelListing = createAsyncThunk(
  'market/cancelListing',
  async (listingId: string, { rejectWithValue }) => {
    try {
      await marketService.cancelListing(listingId);
      return listingId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to cancel listing');
    }
  }
);

export const getTransactionHistory = createAsyncThunk(
  'market/getTransactionHistory',
  async (options: {
    page?: number;
    limit?: number;
    tokenId?: string;
    projectId?: string;
    type?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await marketService.getTransactionHistory(options);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch transaction history');
    }
  }
);

export const getUserListings = createAsyncThunk(
  'market/getUserListings',
  async (options: { active?: boolean } = {}, { rejectWithValue }) => {
    try {
      const response = await marketService.getUserListings(options.active);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user listings');
    }
  }
);

export const getMarketSummary = createAsyncThunk(
  'market/getMarketSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketService.getMarketSummary();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch market summary');
    }
  }
);

export const getPriceHistory = createAsyncThunk(
  'market/getPriceHistory',
  async (
    { tokenId, days = 30 }: { tokenId: string; days?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await marketService.getPriceHistory(tokenId, days);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch price history');
    }
  }
);

export const getPriceRecommendation = createAsyncThunk(
  'market/getPriceRecommendation',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await marketService.getPriceRecommendation(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch price recommendation');
    }
  }
);

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    clearMarketError: (state) => {
      state.error = null;
    },
    clearPriceHistory: (state) => {
      state.priceHistory = [];
    },
    clearPriceRecommendation: (state) => {
      state.priceRecommendation = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Listing
      .addCase(createListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createListing.fulfilled, (state, action: PayloadAction<Listing>) => {
        state.isLoading = false;
        state.listings.push(action.payload);
        state.userListings.push(action.payload);
      })
      .addCase(createListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Listings
      .addCase(getListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getListings.fulfilled, (state, action: PayloadAction<{ data: Listing[]; count: number }>) => {
        state.isLoading = false;
        state.listings = action.payload.data;
        state.totalCount = action.payload.count;
      })
      .addCase(getListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Execute Purchase
      .addCase(executePurchase.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(executePurchase.fulfilled, (state, action: PayloadAction<{
        transaction: Transaction;
        listing: { id: string; tokenId: string; remaining: number; active: boolean };
      }>) => {
        state.isLoading = false;
        // Add the transaction to the history
        state.transactions.unshift(action.payload.transaction);
        
        // Update the listing in listings and userListings
        const updateListing = (listingArray: Listing[]) => {
          const index = listingArray.findIndex((l) => l._id?.toString() === action.payload.listing.id);
          if (index !== -1) {
            listingArray[index] = {
              ...listingArray[index],
              remaining: action.payload.listing.remaining,
              active: action.payload.listing.active
            };
          }
        };
        
        updateListing(state.listings);
        updateListing(state.userListings);
        
        // Remove the listing if it's no longer active
        if (!action.payload.listing.active) {
          state.listings = state.listings.filter((l) => l._id?.toString() !== action.payload.listing.id);
        }
      })
      .addCase(executePurchase.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Cancel Listing
      .addCase(cancelListing.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelListing.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        // Remove the listing from active listings
        state.listings = state.listings.filter((l) => l._id?.toString() !== action.payload);
        // Update the listing in userListings
        const index = state.userListings.findIndex((l) => l._id?.toString() === action.payload);
        if (index !== -1) {
          state.userListings[index] = {
            ...state.userListings[index],
            active: false
          };
        }
      })
      .addCase(cancelListing.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Transaction History
      .addCase(getTransactionHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action: PayloadAction<{ data: Transaction[]; count: number }>) => {
        state.isLoading = false;
        state.transactions = action.payload.data;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get User Listings
      .addCase(getUserListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserListings.fulfilled, (state, action: PayloadAction<{ data: Listing[]; count: number }>) => {
        state.isLoading = false;
        state.userListings = action.payload.data;
      })
      .addCase(getUserListings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Market Summary
      .addCase(getMarketSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMarketSummary.fulfilled, (state, action: PayloadAction<MarketSummary>) => {
        state.isLoading = false;
        state.marketSummary = action.payload;
      })
      .addCase(getMarketSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Price History
      .addCase(getPriceHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPriceHistory.fulfilled, (state, action: PayloadAction<PriceHistoryItem[]>) => {
        state.isLoading = false;
        state.priceHistory = action.payload;
      })
      .addCase(getPriceHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Price Recommendation
      .addCase(getPriceRecommendation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPriceRecommendation.fulfilled, (state, action: PayloadAction<PriceRecommendation>) => {
        state.isLoading = false;
        state.priceRecommendation = action.payload;
      })
      .addCase(getPriceRecommendation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMarketError, clearPriceHistory, clearPriceRecommendation } = marketSlice.actions;
export default marketSlice.reducer;