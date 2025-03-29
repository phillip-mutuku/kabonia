'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { executePurchase as buyToken, createListing } from '@/store/slices/marketSlice';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useRouter } from 'next/navigation';
import { valuationService } from '@/services/valuationService';

interface TokenData {
  _id: string;
  price: number;
  carbonOffset: number;
  projectId?: string;
}

interface BuySellFormProps {
  tokenId?: string;
  initialMode?: 'buy' | 'sell';
  prefilledAmount?: number;
  prefilledPrice?: number;
  maxAmount?: number;
  onComplete?: () => void;
  className?: string;
}

export const BuySellForm: React.FC<BuySellFormProps> = ({
  tokenId,
  initialMode = 'buy',
  prefilledAmount = 1,
  prefilledPrice,
  maxAmount = 100,
  onComplete,
  className = '',
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mode, setMode] = useState<'buy' | 'sell'>(initialMode);
  const [amount, setAmount] = useState(prefilledAmount);
  const [price, setPrice] = useState(prefilledPrice || 0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState({ amount: '', price: '' });

  // Add valuation state
  const [priceRecommendation, setPriceRecommendation] = useState<any>(null);
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState(false);
  const [marketTrend, setMarketTrend] = useState<any>(null);

  const { isLoading, error } = useSelector((state: RootState) => state.market);
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const walletState = useSelector((state: RootState) => state.wallet);
  
  const accountId = walletState.accountId || null;

  const tokens = useSelector((state: RootState) => {
    if (state.token && state.token.userTokens) {
      return state.token.userTokens;
    }
    return [];
  });

  // Find token data if tokenId is provided
  const token = tokens.find(t => t._id === tokenId) as TokenData | undefined;

  // Set default price from token if available
  useEffect(() => {
    if (token && !prefilledPrice) {
      setPrice(token.price);
    }
  }, [token, prefilledPrice]);

  // Fetch price recommendation when in sell mode and we have a token with a project ID
  useEffect(() => {
    if (mode === 'sell' && token?.projectId) {
      fetchPriceRecommendation();
    }
  }, [mode, token]);

  // Fetch market trend data on component mount
  useEffect(() => {
    fetchMarketTrend();
  }, []);

  const fetchPriceRecommendation = async () => {
    if (!token?.projectId) return;
    
    setIsLoadingRecommendation(true);
    try {
      const recommendation = await valuationService.getPriceRecommendation(token.projectId);
      setPriceRecommendation(recommendation);
      
      // If price isn't already set by user or prefilled, use the recommendation
      if (price === 0 || (!prefilledPrice && !token.price)) {
        setPrice(recommendation.recommendedPrice);
      }
    } catch (error) {
      console.error('Error fetching price recommendation:', error);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const fetchMarketTrend = async () => {
    try {
      const trend = await valuationService.getMarketTrend(30);
      setMarketTrend(trend);
    } catch (error) {
      console.error('Error fetching market trend:', error);
    }
  };

  const validateForm = () => {
    const newErrors = { amount: '', price: '' };
    let isValid = true;

    if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
      isValid = false;
    }

    if (amount > maxAmount) {
      newErrors.amount = `Amount exceeds available tokens (${maxAmount})`;
      isValid = false;
    }

    if (mode === 'sell' && price <= 0) {
      newErrors.price = 'Price must be greater than 0';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  
    if (!accountId) {
      alert('Please connect your wallet first');
      return;
    }
  
    if (!validateForm()) {
      return;
    }
  
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }
  
    try {
      if (mode === 'buy' && tokenId) {
        await dispatch(buyToken({ listingId: tokenId, amount }) as any);
      } else if (mode === 'sell' && tokenId) {
        // Set expiration date (e.g., 30 days from now)
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 30);
        
        console.log("Creating listing with:", { 
          tokenId, 
          amount, 
          price, 
          expirationDate 
        });
        
        await dispatch(createListing({ 
          tokenId, 
          amount, 
          price, 
          expirationDate 
        }) as any);
      } else {
        console.error("Cannot complete transaction: missing tokenId");
      }
  
      setShowConfirmation(false);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  const totalCost = amount * price;

  // Helper function to use recommended price
  const useRecommendedPrice = () => {
    if (priceRecommendation?.recommendedPrice) {
      setPrice(priceRecommendation.recommendedPrice);
    }
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="mb-4 border-b border-gray-200">
        <div className="flex">
          <button
            type="button"
            className={`pb-2 px-4 text-sm font-medium ${
              mode === 'buy'
                ? 'text-maroon-600 border-b-2 border-maroon-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setMode('buy');
              setShowConfirmation(false);
            }}
          >
            Buy
          </button>
          <button
            type="button"
            className={`pb-2 px-4 text-sm font-medium ${
              mode === 'sell'
                ? 'text-maroon-600 border-b-2 border-maroon-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => {
              setMode('sell');
              setShowConfirmation(false);
            }}
          >
            Sell
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">


          {/* Market trend indicator */}
          {marketTrend && (
            <div className="mb-4 py-2 px-3 bg-gray-50 rounded-md text-xs flex justify-between items-center">
              <span>Market Trend:</span>
              <span className={
                marketTrend.trend === 'rising' ? 'text-green-600 font-medium' :
                marketTrend.trend === 'falling' ? 'text-red-600 font-medium' :
                'text-gray-600 font-medium'
              }>
                {marketTrend.trend === 'rising' && '↑ '}
                {marketTrend.trend === 'falling' && '↓ '}
                {marketTrend.trend === 'rising' ? 'Rising' : 
                 marketTrend.trend === 'falling' ? 'Falling' : 'Stable'} 
                ({Math.abs(marketTrend.changePercent).toFixed(1)}%)
              </span>
            </div>
          )}

          <Input
            label="Amount"
            id="amount"
            type="number"
            min="1"
            max={maxAmount}
            value={amount}
            onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
            error={errors.amount}
            disabled={isLoading}
            helperText={`Available: ${maxAmount} credits`}
          />

          {mode === 'sell' && (
            <>
              <Input
                label="Price per Credit ($)"
                id="price"
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                error={errors.price}
                disabled={isLoading}
                helperText={`Suggested: $${token?.price?.toFixed(2) || '15.00'}`}
              />

              {/* AI Price Recommendation */}
              {isLoadingRecommendation ? (
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <svg className="animate-spin h-4 w-4 mr-2 text-maroon-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading AI price recommendation...
                </div>
              ) : priceRecommendation ? (
                <div className="p-3 bg-maroon-50 rounded-md border border-maroon-100 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">AI Price Recommendation:</span>
                    <span className="text-sm font-bold text-maroon-700">${priceRecommendation.recommendedPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Market range:</span>
                    <span>${priceRecommendation.priceRange.min.toFixed(2)} - ${priceRecommendation.priceRange.max.toFixed(2)}</span>
                  </div>
                  <div className="mt-1 text-xs">
                    <span className="text-gray-500">Market trend: </span>
                    <span className={
                      priceRecommendation.marketTrend === 'rising' ? 'text-green-600' :
                      priceRecommendation.marketTrend === 'falling' ? 'text-red-600' :
                      'text-gray-600'
                    }>
                      {priceRecommendation.marketTrend === 'rising' ? '↑ Rising' : 
                       priceRecommendation.marketTrend === 'falling' ? '↓ Falling' : 'Stable'}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={useRecommendedPrice}
                    className="mt-2 text-xs text-maroon-600 hover:text-maroon-700 flex items-center"
                  >
                    <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Use recommended price
                  </button>
                </div>
              ) : null}
            </>
          )}

          <div className="py-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">
                {mode === 'buy' ? 'Total Cost' : 'Total Earnings'}:
              </span>
              <span className="font-bold text-gray-900">
                ${totalCost.toFixed(2)}
              </span>
            </div>
            {mode === 'buy' && token && (
              <div className="flex justify-between text-sm mt-1">
                <span className="font-medium text-gray-700">Carbon Offset:</span>
                <span className="text-gray-900">
                  {(token.carbonOffset * amount).toFixed(2)} tons
                </span>
              </div>
            )}
          </div>

          {showConfirmation ? (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                {mode === 'buy'
                  ? `You are about to buy ${amount} carbon credits for a total of $${totalCost.toFixed(2)}.`
                  : `You are about to list ${amount} carbon credits for sale at $${price.toFixed(2)} each.`}
              </p>
              <div className="flex space-x-3">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isLoading}
                  className="flex-1 bg-maroon-600 hover:bg-maroon-700"
                >
                  Confirm
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="submit"
              variant={mode === 'buy' ? 'primary' : 'secondary'}
              isLoading={isLoading}
              fullWidth
              className={mode === 'buy' ? 'bg-maroon-600 hover:bg-maroon-700' : ''}
            >
              {mode === 'buy' ? 'Buy Credits' : 'Sell Credits'}
            </Button>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          {!isAuthenticated && (
            <p className="text-center text-sm text-red-600 mt-2">
              Please login to {mode} carbon credits
            </p>
          )}

          {isAuthenticated && !accountId && (
            <p className="text-center text-sm text-red-600 mt-2">
              Please connect your wallet to {mode} carbon credits
            </p>
          )}
        </div>
      </form>
    </Card>
  );
};