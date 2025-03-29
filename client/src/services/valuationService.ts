import api from './api';

export interface MarketPriceData {
  date: string;
  price: number;
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface PredictionFactors {
  location: string;
  projectType: string;
  duration: string;
  scale: string;
}

export interface AIPrediction {
  creditValue: number;
  confidence: number;
  marketTrend: 'rising' | 'falling' | 'stable';
  factors: PredictionFactors;
  recommendedInitialPrice: number;
  priceRange: PriceRange;
}

export interface PriceRecommendation {
  recommendedPrice: number;
  aiPrediction: number;
  marketAverage: number;
  confidence: number;
  priceRange: PriceRange;
  marketTrend: 'rising' | 'falling' | 'stable';
}

export interface ProjectData {
  projectType: string;
  area: number;
  location: string;
  estimatedCarbonCapture: number;
  actualCarbonCapture?: number;
  startDate: Date;
  endDate: Date;
  [key: string]: any;
}

export const valuationService = {
  /**
   * Calculate carbon credit value based on project data
   */
  calculateCreditValue: async (projectData: ProjectData): Promise<number> => {
    const response = await api.post<{ success: boolean; data: number }>('/valuation/calculate-value', projectData);
    return response.data.data;
  },

  /**
   * Get AI prediction for project valuation
   */
  getAIPrediction: async (projectData: ProjectData): Promise<AIPrediction> => {
    const response = await api.post<{ success: boolean; data: AIPrediction }>('/valuation/prediction', projectData);
    return response.data.data;
  },

  /**
   * Get market price history for tokens
   */
  getMarketPriceHistory: async (tokenId?: string, days: number = 30): Promise<MarketPriceData[]> => {
    const response = await api.get<{ success: boolean; data: MarketPriceData[] }>('/valuation/market-history', {
      params: { tokenId, days }
    });
    return response.data.data;
  },

  /**
   * Get price recommendation for a token
   */
  getPriceRecommendation: async (projectId: string): Promise<PriceRecommendation> => {
    const response = await api.get<{ success: boolean; data: PriceRecommendation }>(`/valuation/recommendation/${projectId}`);
    return response.data.data;
  },

  /**
   * Get current market average price
   */
  getCurrentMarketPrice: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; data: number }>('/valuation/current-market-price');
    return response.data.data;
  },

  /**
   * Get market trend overview
   */
  getMarketTrend: async (days: number = 30): Promise<{
    trend: 'rising' | 'falling' | 'stable';
    changePercent: number;
    averagePrice: number;
    volatility: number;
  }> => {
    const response = await api.get<{
      success: boolean;
      data: {
        trend: 'rising' | 'falling' | 'stable';
        changePercent: number;
        averagePrice: number;
        volatility: number;
      }
    }>('/valuation/market-trend', {
      params: { days }
    });
    return response.data.data;
  },

  /**
   * Get project type performance comparison
   */
  getProjectTypePerformance: async (): Promise<{
    [key: string]: {
      averagePrice: number;
      trend: 'rising' | 'falling' | 'stable';
      changePercent: number;
    }
  }> => {
    const response = await api.get<{
      success: boolean;
      data: {
        [key: string]: {
          averagePrice: number;
          trend: 'rising' | 'falling' | 'stable';
          changePercent: number;
        }
      }
    }>('/valuation/project-type-performance');
    return response.data.data;
  },

  /**
   * Calculate ROI projection
   */
  calculateROIProjection: async (
    initialInvestment: number,
    projectType: string,
    holdingPeriod: number,
    riskTolerance: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<{
    projectedValue: number;
    absoluteReturn: number;
    percentageReturn: number;
    annualizedReturn: number;
    scenarios: {
      conservative: number;
      expected: number;
      optimistic: number;
    }
  }> => {
    const response = await api.post<{
      success: boolean;
      data: {
        projectedValue: number;
        absoluteReturn: number;
        percentageReturn: number;
        annualizedReturn: number;
        scenarios: {
          conservative: number;
          expected: number;
          optimistic: number;
        }
      }
    }>('/valuation/roi-projection', {
      initialInvestment,
      projectType,
      holdingPeriod,
      riskTolerance
    });
    return response.data.data;
  }
};

export default valuationService;