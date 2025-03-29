'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getTokenById } from '@/store/slices/tokenSlice';
import { valuationService, MarketPriceData } from '@/services/valuationService';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { BuySellForm } from '@/components/marketplace/BuySellForm';
import Link from 'next/link';

export interface TokenDetailState {
  token: any;
  isLoading: boolean;
  error: string | null;
}

export default function TokenDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { tokenId } = useParams() as { tokenId: string };
  
  const { token, isLoading, error } = useSelector((state: RootState) => ({
    token: (state.token as any).selectedToken,
    isLoading: state.token.isLoading,
    error: state.token.error
  }));

  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number; }>>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [priceForecast, setPriceForecast] = useState<Array<{ date: string; price: null; forecastPrice: number; }>>([]);
  const [showBuySellModal, setShowBuySellModal] = useState(false);
  const [buySellMode, setBuySellMode] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    // Fetch token details
    if (tokenId) {
      dispatch(getTokenById(tokenId) as any);
    }
  }, [dispatch, tokenId]);

  useEffect(() => {
    // Fetch price history and generate forecast when token is loaded
    if (token) {
      fetchPriceData();
    }
  }, [token]);

  const fetchPriceData = async () => {
    try {
      setIsLoadingHistory(true);
      
      // Get historical data
      const history = await valuationService.getMarketPriceHistory(tokenId, 90);
      setPriceHistory(history);
      
      // Get prediction data if we have a project ID
      if (token?.projectId) {
        const recommendation = await valuationService.getPriceRecommendation(token.projectId);
        
        // Generate forecast data for next 30 days
        const today = new Date();
        const forecast: Array<{ date: string; price: null; forecastPrice: number }> = [];
        
        // Base the forecast on the recommended price and market trend
        const trendFactor = recommendation.marketTrend === 'rising' ? 1.002 : 
                           recommendation.marketTrend === 'falling' ? 0.998 : 1.0;
        
        let forecastPrice = recommendation.recommendedPrice;
        
        for (let i = 1; i <= 30; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          
          // Apply trend and some randomness
          forecastPrice = forecastPrice * trendFactor * (0.995 + Math.random() * 0.01);
          
          forecast.push({
            date: date.toISOString().split('T')[0],
            price: null,
            forecastPrice: Math.round(forecastPrice * 100) / 100
          });
        }
        
        setPriceForecast(forecast);
      }
    } catch (error) {
      console.error('Error fetching price data:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleBuySell = (mode: 'buy' | 'sell') => {
    setBuySellMode(mode);
    setShowBuySellModal(true);
  };

  const handleBuySellComplete = () => {
    setShowBuySellModal(false);
    // Refresh token data
    dispatch(getTokenById(tokenId) as any);
  };

  // Format date for display
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Combine historical and forecast data for the chart
  const chartData = [
    ...priceHistory.map(item => ({
      ...item,
      forecastPrice: null as null
    })),
    ...priceForecast
  ];

  const today = new Date().toISOString().split('T')[0];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-16">
          <svg
            className="animate-spin h-12 w-12 text-maroon-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Card className="p-6 bg-red-50 border border-red-200">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="ml-3 text-lg font-medium text-red-800">Error loading token details</h3>
          </div>
          <div className="mt-2 text-sm text-red-700">
            <p>{error}</p>
          </div>
          <div className="mt-4">
            <Button
              type="button"
              onClick={() => router.back()}
              variant="secondary"
            >
              Go Back
            </Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  if (!token) {
    return (
      <DashboardLayout>
        <Card className="p-6">
          <div className="text-center">
            <h3 className="mt-2 text-lg font-medium text-gray-900">Token not found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The token you are looking for does not exist or has been removed.
            </p>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => router.back()}
                className="bg-maroon-600 hover:bg-maroon-700"
              >
                Go Back
              </Button>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">{token.name}</h1>
              {token.verified && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Verified
                </span>
              )}
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                ${token.status === 'available' ? 'bg-green-100 text-green-800' : 
                  token.status === 'listed' ? 'bg-blue-100 text-blue-800' : 
                  token.status === 'retired' ? 'bg-gray-100 text-gray-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {token.status?.charAt(0).toUpperCase() + token.status?.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {token.description || `Carbon credit from ${token.projectName}`}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {token.status === 'available' && (
              <Button 
                variant="primary" 
                onClick={() => handleBuySell('sell')}
                className="bg-maroon-600 hover:bg-maroon-700"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                Sell Token
              </Button>
            )}
            {token.status === 'listed' && (
              <Button 
                variant="secondary"
                onClick={() => handleBuySell('buy')}
              >
                Remove Listing
              </Button>
            )}
          </div>
        </div>

        {/* Token Details */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Token Details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Token ID</p>
                  <p className="text-base font-medium text-gray-900 truncate">{token.tokenId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Value</p>
                  <p className="text-base font-medium text-gray-900">${token.price?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Carbon Offset</p>
                  <p className="text-base font-medium text-gray-900">{token.carbonOffset} tons</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="text-base font-medium text-gray-900">{token.amount} credits</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project</p>
                  <Link href={`/projects/${token.projectId}`}>
                    <p className="text-base font-medium text-maroon-600 hover:text-maroon-700">{token.projectName}</p>
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Project Type</p>
                  <p className="text-base font-medium text-gray-900">{token.projectType}</p>
                </div>
                {token.location && (
                  <div className="sm:col-span-2">
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="text-base font-medium text-gray-900">{token.location}</p>
                  </div>
                )}
                {token.createdAt && (
                  <div>
                    <p className="text-sm text-gray-500">Created On</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(token.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {token.listedAt && (
                  <div>
                    <p className="text-sm text-gray-500">Listed On</p>
                    <p className="text-base font-medium text-gray-900">
                      {new Date(token.listedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Current Valuation</h2>
              
              <div className="py-3 border-b border-gray-200">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Price per Credit</p>
                  <p className="text-lg font-bold text-gray-900">${token.price?.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="py-3 border-b border-gray-200">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Total Value</p>
                  <p className="text-lg font-bold text-gray-900">${(token.price * token.amount).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="py-3 border-b border-gray-200">
                <div className="flex justify-between">
                  <p className="text-sm text-gray-500">Carbon Impact</p>
                  <p className="text-lg font-bold text-gray-900">{(token.carbonOffset * token.amount).toFixed(2)} tons</p>
                </div>
              </div>
              
              <div className="mt-6">
                {token.status === 'available' ? (
                  <Button 
                    variant="primary" 
                    onClick={() => handleBuySell('sell')}
                    fullWidth
                    className="bg-maroon-600 hover:bg-maroon-700"
                  >
                    Sell This Token
                  </Button>
                ) : token.status === 'listed' ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-500 text-center">This token is currently listed for sale</p>
                    <Button 
                      variant="secondary" 
                      onClick={() => handleBuySell('buy')}
                      fullWidth
                    >
                      Remove from Marketplace
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center">
                    This token cannot be sold because it is {token.status}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Price History Chart */}
        <Card className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Price History & Forecast</h2>
          
          {isLoadingHistory ? (
            <div className="h-60 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-maroon-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : chartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                    ticks={chartData.filter((_, i) => i % 15 === 0).map(item => item.date)}
                  />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    formatter={(value) => value ? `$${value}` : null}
                    labelFormatter={formatDate}
                  />
                  <Legend />
                  <ReferenceLine x={today} stroke="#666" strokeDasharray="3 3" label="Today" />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    name="Historical Price"
                    stroke="#800020" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }} 
                    connectNulls
                  />
                  <Line 
                    type="monotone" 
                    dataKey="forecastPrice" 
                    name="Forecasted Price"
                    stroke="#FFA500" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }} 
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-gray-500 italic">
                * Forecast based on AI analysis of market trends, project characteristics, and historical data
              </div>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center">
              <p className="text-gray-500">No price history data available</p>
            </div>
          )}
        </Card>

        {/* Buy/Sell Modal */}
        {showBuySellModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  {buySellMode === 'buy' ? 'Remove Listing' : 'Sell Carbon Credits'}
                </h3>
                <button
                  onClick={() => setShowBuySellModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-5">
                <BuySellForm
                  tokenId={token._id}
                  initialMode={buySellMode}
                  prefilledAmount={1}
                  prefilledPrice={token.price}
                  maxAmount={token.amount}
                  onComplete={handleBuySellComplete}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}