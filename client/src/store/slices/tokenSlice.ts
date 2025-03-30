import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Token, TokenBalance, CreateTokenInput, TokenTransferInput, TokenMintInput } from '@/types/token';
import { tokenService } from '@/services/tokenService';
import { QueryOptions } from '@/types/index';

export interface TokenQueryOptions extends QueryOptions {
  projectId?: string;
  status?: string;
  projectType?: string;
  verified?: boolean;
}

interface TokenState {
  tokens: Token[];
  projectTokens: Token[];
  userTokens: TokenBalance[];
  currentToken: Token | null;
  currentBalance: number | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const initialState: TokenState = {
  tokens: [],
  projectTokens: [],
  userTokens: [],
  currentToken: null,
  currentBalance: null,
  isLoading: false,
  error: null,
  totalCount: 0,
};

// Async thunks
export const getTokens = createAsyncThunk(
  'token/getTokens',
  async (options: TokenQueryOptions = {}, { rejectWithValue }) => {
    try {
      const response = await tokenService.getTokens(options);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch tokens');
    }
  }
);

export const createToken = createAsyncThunk(
  'token/createToken',
  async (tokenData: CreateTokenInput, { rejectWithValue }) => {
    try {
      const response = await tokenService.createToken(tokenData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to create token');
    }
  }
);

export const getTokenById = createAsyncThunk(
  'token/getTokenById',
  async (tokenId: string, { rejectWithValue }) => {
    try {
      const response = await tokenService.getTokenById(tokenId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch token');
    }
  }
);

export const transferToken = createAsyncThunk(
  'token/transferToken',
  async (transferData: TokenTransferInput, { rejectWithValue }) => {
    try {
      const response = await tokenService.transferToken(transferData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to transfer token');
    }
  }
);

export const mintTokens = createAsyncThunk(
  'token/mintTokens',
  async (mintData: TokenMintInput, { rejectWithValue }) => {
    try {
      const response = await tokenService.mintTokens(mintData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to mint tokens');
    }
  }
);

export const getTokenBalance = createAsyncThunk(
  'token/getTokenBalance',
  async (tokenId: string, { rejectWithValue }) => {
    try {
      const response = await tokenService.getTokenBalance(tokenId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch token balance');
    }
  }
);

export const getUserTokens = createAsyncThunk(
  'token/getUserTokens',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tokenService.getUserTokens();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user tokens');
    }
  }
);

export const getProjectTokens = createAsyncThunk(
  'token/getProjectTokens',
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await tokenService.getProjectTokens(projectId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch project tokens');
    }
  }
);

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearCurrentToken: (state) => {
      state.currentToken = null;
      state.currentBalance = null;
    },
    clearTokenError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Token
      .addCase(createToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createToken.fulfilled, (state, action: PayloadAction<Token>) => {
        state.isLoading = false;
        state.tokens.push(action.payload);
        state.projectTokens.push(action.payload);
        state.currentToken = action.payload;
      })
      .addCase(createToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Tokens
      .addCase(getTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTokens.fulfilled, (state, action: PayloadAction<{ data: Token[]; count: number }>) => {
        state.isLoading = false;
        state.tokens = action.payload.data;
        state.totalCount = action.payload.count;
      })
      .addCase(getTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Token by ID
      .addCase(getTokenById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTokenById.fulfilled, (state, action: PayloadAction<Token>) => {
        state.isLoading = false;
        state.currentToken = action.payload;
      })
      .addCase(getTokenById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Transfer Token
      .addCase(transferToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(transferToken.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        // Update the user tokens balance when data is refreshed
      })
      .addCase(transferToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Mint Tokens
      .addCase(mintTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(mintTokens.fulfilled, (state, action: PayloadAction<{
        token: Token & { 
          currentSupply?: number; 
          lastMintDate?: string; 
        };
      }>) => {
        state.isLoading = false;
        
        // Update current token if it's the one being minted
        if (state.currentToken && action.payload.token.tokenId === state.currentToken.tokenId) {
          state.currentToken = {
            ...state.currentToken,
            ...(action.payload.token.currentSupply !== undefined 
              ? { currentSupply: action.payload.token.currentSupply } 
              : {}),
            ...(action.payload.token.lastMintDate !== undefined 
              ? { lastMintDate: action.payload.token.lastMintDate } 
              : {})
          };
        }
        
        // Update token in tokens list
        const index = state.tokens.findIndex((t) => t.tokenId === action.payload.token.tokenId);
        if (index !== -1) {
          state.tokens[index] = {
            ...state.tokens[index],
            ...(action.payload.token.currentSupply !== undefined 
              ? { currentSupply: action.payload.token.currentSupply } 
              : {}),
            ...(action.payload.token.lastMintDate !== undefined 
              ? { lastMintDate: action.payload.token.lastMintDate } 
              : {})
          };
        }
        
        // Update token in project tokens list
        const projectIndex = state.projectTokens.findIndex((t) => t.tokenId === action.payload.token.tokenId);
        if (projectIndex !== -1) {
          state.projectTokens[projectIndex] = {
            ...state.projectTokens[projectIndex],
            ...(action.payload.token.currentSupply !== undefined 
              ? { currentSupply: action.payload.token.currentSupply } 
              : {}),
            ...(action.payload.token.lastMintDate !== undefined 
              ? { lastMintDate: action.payload.token.lastMintDate } 
              : {})
          };
        }
      })
      .addCase(mintTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Token Balance
      .addCase(getTokenBalance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTokenBalance.fulfilled, (state, action: PayloadAction<{ tokenId: string; balance: number }>) => {
        state.isLoading = false;
        state.currentBalance = action.payload.balance;
      })
      .addCase(getTokenBalance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get User Tokens
      .addCase(getUserTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserTokens.fulfilled, (state, action: PayloadAction<{ data: TokenBalance[]; count: number }>) => {
        state.isLoading = false;
        state.userTokens = action.payload.data;
      })
      .addCase(getUserTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Get Project Tokens
      .addCase(getProjectTokens.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getProjectTokens.fulfilled, (state, action: PayloadAction<{ data: Token[]; count: number }>) => {
        state.isLoading = false;
        state.projectTokens = action.payload.data;
      })
      .addCase(getProjectTokens.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentToken, clearTokenError } = tokenSlice.actions;
export default tokenSlice.reducer;