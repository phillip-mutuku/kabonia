import api from './api';
import { 
  Token, 
  TokenBalance, 
  CreateTokenInput, 
  TokenTransferInput, 
  TokenMintInput 
} from '@/types/token';

export const tokenService = {
  /**
   * Create a new token for a project
   */
  createToken: async (tokenData: CreateTokenInput): Promise<Token> => {
    const response = await api.post<{ success: boolean; data: Token }>('/tokens', tokenData);
    return response.data.data;
  },
  /**
   * Get all tokens with optional filtering
   */
  getTokens: async (options: { page?: number; limit?: number; projectId?: string } = {}): Promise<{ data: Token[]; count: number }> => {
    const { page, limit, projectId } = options;
    const response = await api.get<{ success: boolean; data: Token[]; count: number }>('/tokens', {
      params: { page, limit, projectId }
    });
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get a token by ID
   */
  getTokenById: async (tokenId: string): Promise<Token> => {
    const response = await api.get<{ success: boolean; data: Token }>(`/tokens/${tokenId}`);
    return response.data.data;
  },

  /**
   * Transfer tokens
   */
  transferToken: async (transferData: TokenTransferInput): Promise<any> => {
    const response = await api.post<{ success: boolean; data: any }>('/tokens/transfer', transferData);
    return response.data.data;
  },

  /**
   * Mint additional tokens
   */
  mintTokens: async (mintData: TokenMintInput): Promise<any> => {
    const response = await api.post<{ success: boolean; data: any }>('/tokens/mint', mintData);
    return response.data.data;
  },

  /**
   * Get token balance
   */
  getTokenBalance: async (tokenId: string): Promise<{ tokenId: string; balance: number }> => {
    const response = await api.get<{ success: boolean; data: { tokenId: string; balance: number } }>(`/tokens/${tokenId}/balance`);
    return response.data.data;
  },

  /**
   * Get all tokens owned by the current user
   */
  getUserTokens: async (): Promise<{ data: TokenBalance[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: TokenBalance[]; count: number }>('/tokens/me');
    return { data: response.data.data, count: response.data.count || 0 };
  },

  /**
   * Get tokens for a specific project
   */
  getProjectTokens: async (projectId: string): Promise<{ data: Token[]; count: number }> => {
    const response = await api.get<{ success: boolean; data: Token[]; count: number }>(`/tokens/project/${projectId}`);
    return { data: response.data.data, count: response.data.count || 0 };
  }
};