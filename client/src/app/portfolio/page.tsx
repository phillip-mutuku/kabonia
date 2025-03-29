'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { getUserTokens } from '@/store/slices/tokenSlice';
import { getTransactionHistory } from '@/store/slices/marketSlice';
import { PortfolioSummary } from '@/components/portfolio/PortfolioSummary';
import { TokensBreakdown } from '@/components/portfolio/TokensBreakdown';
import { TokenCard } from '@/components/marketplace/TokenCard';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { valuationService } from '@/services/valuationService';
import { BuySellForm } from '@/components/marketplace/BuySellForm';
import Link from 'next/link';
import { adaptTokenBalanceToToken } from '@/types/token';

export default function PortfolioPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { userTokens, isLoading: tokensLoading, isAuthenticated } = useSelector((state: RootState) => ({
    userTokens: state.token.userTokens,
    isLoading: state.token.isLoading,
    isAuthenticated: state.user.isAuthenticated
  }));
  
  const { userTransactions, isLoading: transactionsLoading } = useSelector((state: RootState) => ({
    userTransactions: state.market.transactions,
    isLoading: state.market.isLoading
  }));
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [projectTypePerformance, setProjectTypePerformance] = useState<any>(null);
  const [roiProjection, setRoiProjection] = useState<any>(null);
  const [showBuySellModal, setShowBuySellModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getUserTokens({} as any));
      dispatch(getTransactionHistory({} as any));
      fetchValuationData();
    }
  }, [dispatch, isAuthenticated]);

  const fetchValuationData = async () => {
    try {
      setIsLoadingInsights(true);
      
      // Fetch project type performance
      const performance = await valuationService.getProjectTypePerformance();
      setProjectTypePerformance(performance);
      
      // Calculate ROI projection
      const roi = await valuationService.calculateROIProjection(
        10000, // Sample investment amount
        'reforestation', // Most common project type
        12, // 12 months holding period
        'medium' // Medium risk tolerance
      );
      setRoiProjection(roi);
    } catch (error) {
      console.error("Error fetching valuation data:", error);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  // Calculate portfolio statistics
  const totalTokens = userTokens.reduce((sum, token) => sum + token.amount, 0);
  const totalValue = userTokens.reduce((sum, token) => sum + (token.amount * (token.price || 0)), 0);
  const totalCarbonOffset = userTokens.reduce((sum, token) => sum + (token.carbonOffset * token.amount), 0);
  
  // Filter tokens based on selected filter
  const filteredTokens = userTokens.filter(token => {
    if (selectedFilter === 'all') return true;
    return token.projectType && token.projectType.toLowerCase() === selectedFilter.toLowerCase();
  });

  // Extract unique project types for filter options
  const projectTypes = ['all', ...Array.from(new Set(userTokens
    .filter(token => token.projectType)
    .map(token => token.projectType.toLowerCase())))];
  
  const handleSellToken = (token: any) => {
    setSelectedToken(token);
    setShowBuySellModal(true);
  };

  // Add a click handler to handle selling from your token list
  const handleTokenCardClick = (token: any) => {
    handleSellToken(token);
  };

  const handleBuySellComplete = () => {
    setShowBuySellModal(false);
    setSelectedToken(null);
    // Refresh the token list
    dispatch(getUserTokens({} as any));
  };
  
  // Find the best performing project type
  const getBestPerformingProjectType = () => {
    if (!projectTypePerformance) return { type: null, performance: 0 };
    
    let bestType = '';
    let bestPerformance = -Infinity;
    
    for (const [type, data] of Object.entries(projectTypePerformance)) {
      const performance = (data as any).changePercent;
      if (performance > bestPerformance) {
        bestPerformance = performance;
        bestType = type;
      }
    }
    
    return { type: bestType, performance: bestPerformance };
  };
  
  const bestPerformer = getBestPerformingProjectType();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Carbon Credit Portfolio</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your carbon credits, view transactions, and measure your impact.
            </p>
          </div>
          
          {userTokens.length > 0 && (
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/marketplace'}
                className="bg-maroon-600 hover:bg-maroon-700 text-white"
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
                Buy More Credits
              </Button>
            </div>
          )}
        </div>

        {/* Portfolio Summary */}
        <PortfolioSummary 
          totalTokens={totalTokens}
          totalValue={totalValue}
          totalCarbonOffset={totalCarbonOffset}
          tokensLoading={tokensLoading}
        />
        
        {/* Portfolio Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Portfolio Value & Market Trend</h3>
          <div className="h-96">
            <PortfolioChart />
          </div>
        </Card>

        {/* AI Insights Card */}
        {projectTypePerformance && (
          <Card className="p-4 bg-gray-50 border border-gray-200">
            <div className="flex items-center mb-4">
              <svg className="h-6 w-6 text-maroon-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900">AI Market Insights</h3>
            </div>
            
            {isLoadingInsights ? (
              <div className="flex justify-center py-6">
                <svg className="animate-spin h-8 w-8 text-maroon-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : (
              <div className="space-y-4">
                {bestPerformer && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">AI Investment Recommendation:</p>
                    <p className="text-lg font-medium text-gray-900 mt-1">
                      {bestPerformer.type?.charAt(0).toUpperCase() + bestPerformer.type?.slice(1).replace('_', ' ')} 
                      projects are currently showing the strongest performance 
                      ({Math.abs(bestPerformer.performance).toFixed(1)}% {bestPerformer.performance > 0 ? 'growth' : 'decline'}).
                    </p>
                    
                    {roiProjection && (
                      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">1-Year ROI (Expected)</p>
                          <p className="text-lg font-semibold text-maroon-600">{roiProjection.percentageReturn.toFixed(1)}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Conservative Est.</p>
                          <p className="text-lg font-semibold text-gray-700">${roiProjection.scenarios.conservative}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-xs text-gray-500">Optimistic Est.</p>
                          <p className="text-lg font-semibold text-gray-700">${roiProjection.scenarios.optimistic}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {Object.entries(projectTypePerformance).map(([type, data]: [string, any]) => (
                    <div key={type} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center mb-1">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ 
                          backgroundColor: type === 'reforestation' ? '#056835' : 
                                          type === 'conservation' ? '#800020' : 
                                          type === 'renewable_energy' ? '#FFB30F' : 
                                          type === 'methane_capture' ? '#BF800F' : '#64A8DD'
                        }}></div>
                        <span className="text-xs font-medium text-gray-800 truncate">
                          {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Avg:</span>
                        <span className="font-medium">${data.averagePrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Trend:</span>
                        <span className={
                          data.trend === 'rising' ? 'text-green-600 font-medium' :
                          data.trend === 'falling' ? 'text-red-600 font-medium' :
                          'text-gray-600 font-medium'
                        }>
                          {data.trend === 'rising' ? '↑ ' : data.trend === 'falling' ? '↓ ' : ''}
                          {Math.abs(data.changePercent).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Portfolio Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Token Filters */}
            <div className="mb-4 flex items-center space-x-2 overflow-x-auto py-1">
              {projectTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedFilter(type)}
                  className={`px-3 py-1 text-sm font-medium rounded-full whitespace-nowrap ${
                    selectedFilter === type
                      ? 'bg-maroon-100 text-maroon-800'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Tokens Grid */}
            {tokensLoading ? (
              <div className="flex justify-center py-12">
                <svg
                  className="animate-spin h-10 w-10 text-maroon-600"
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
            ) : filteredTokens.length === 0 ? (
              <Card className="p-6">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      vectorEffect="non-scaling-stroke"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No carbon credits found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {selectedFilter === 'all'
                      ? 'You don\'t own any carbon credits yet.'
                      : `You don't have any ${selectedFilter} carbon credits.`}
                  </p>
                  <div className="mt-6">
                    <Link href="/marketplace">
                      <Button 
                        variant="primary"
                        className="bg-maroon-600 hover:bg-maroon-700 text-white"
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
                        Buy Carbon Credits
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTokens.map((token) => (
                  <TokenCard 
                    key={token.tokenId || token._id} 
                    token={adaptTokenBalanceToToken(token)}
                    showBuyButton={false}
                    // Remove the onSellClick prop if it's not supported
                  />
                ))}
              </div>
            )}

            {/* Token Actions */}
            {userTokens.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setSelectedToken(null);
                    setShowBuySellModal(true);
                  }}
                  className="bg-maroon-600 hover:bg-maroon-700 text-white"
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
                      d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Sell Credits
                </Button>
                <Link href="/tokens/transfer">
                  <Button 
                    variant="secondary"
                    className="border border-gray-300 hover:bg-gray-100"
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
                        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                      />
                    </svg>
                    Transfer Credits
                  </Button>
                </Link>
                <Link href="/tokens/retire">
                  <Button 
                    variant="secondary"
                    className="border border-gray-300 hover:bg-gray-100"
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
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Retire Credits
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Tokens Breakdown */}
            <TokensBreakdown tokens={userTokens} loading={tokensLoading} />
            
            {/* Recent Transactions */}
            <Card className="overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
              </div>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-maroon-600"
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
              ) : userTransactions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-500">No transaction history yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden">
                  <ul className="divide-y divide-gray-200">
                  {userTransactions.slice(0, 5).map((transaction) => (
                      <li key={transaction._id} className="px-4 py-4">
                        <div className="flex items-center justify-between">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'buy'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(transaction.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-900">
                            {transaction.amount} credits at ${transaction.price ? transaction.price.toFixed(2) : '0.00'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total: ${transaction.total ? transaction.total.toFixed(2) : '0.00'}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-gray-200 px-4 py-4">
                    <Link href="/transactions" className="text-sm font-medium text-maroon-600 hover:text-maroon-500">
                      View all transactions
                      <span aria-hidden="true"> &rarr;</span>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      
      {/* Buy/Sell Modal */}
      {showBuySellModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden relative">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Sell Carbon Credits
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
                tokenId={selectedToken?._id}
                initialMode="sell"
                prefilledAmount={1}
                prefilledPrice={selectedToken?.price}
                maxAmount={selectedToken?.amount || 100}
                onComplete={handleBuySellComplete}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}