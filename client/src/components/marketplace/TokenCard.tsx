'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Listing } from '@/types/market';
import { valuationService } from '@/services/valuationService';

interface TokenCardProps {
  token: Listing & { _id?: string | { toString(): string } | any }; 
  onBuy?: (tokenId: string, amount: number) => void;
  showBuyButton?: boolean;
  className?: string;
  buttonClassName?: string;
  accentColor?: string;
}

// Function to safely extract MongoDB ObjectId
const extractId = (idField: any): string => {
  if (!idField) return '';
  
  let idStr = '';
  
  // Handle different formats of ID
  if (typeof idField === 'object' && idField !== null) {
    if (idField._id) {
      idStr = typeof idField._id === 'string' ? idField._id : String(idField._id);
    } else if (idField.id) {
      idStr = typeof idField.id === 'string' ? idField.id : String(idField.id);
    } else if (idField.toString) {
      idStr = idField.toString();
    }
  } else if (typeof idField === 'string') {
    idStr = idField;
  } else if (idField) {
    idStr = String(idField);
  }
  
  // Validate MongoDB ObjectId format (24 character hex string)
  if (/^[0-9a-fA-F]{24}$/.test(idStr)) {
    return idStr;
  }
  
  console.warn('Invalid MongoDB ObjectId format:', idStr, 'Original value:', idField);
  return idStr;
};

export const TokenCard: React.FC<TokenCardProps> = ({ 
  token, 
  onBuy, 
  showBuyButton = true,
  className = '',
  buttonClassName = '',
  accentColor = '#800020'
}) => {
  const [buyAmount, setBuyAmount] = useState(1);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [priceRecommendation, setPriceRecommendation] = useState<any>(null);
  const [marketTrend, setMarketTrend] = useState<any>(null);
  
  const { isAuthenticated } = useSelector((state: RootState) => state.user);
  const walletState = useSelector((state: RootState) => state.wallet);
  const accountId = walletState.accountId || null;

  // Extract token ID reliably as MongoDB ObjectId
  const getTokenId = (): string => {
    if (!token) return '';
    
    let idStr = '';
    
    // Try _id first
    if (token._id) {
      if (typeof token._id === 'string') {
        idStr = token._id;
      } else if (typeof token._id === 'object' && token._id !== null) {
        // MongoDB ObjectId objects have a toString method
        if (token._id.toString) {
          idStr = token._id.toString();
        } else if (token._id._id) {
          // Handle nested _id objects
          idStr = typeof token._id._id === 'string' ? token._id._id : String(token._id._id);
        }
      } else {
        idStr = String(token._id);
      }
    } 
    // Try tokenId if _id doesn't exist or didn't yield a valid ID
    else if (token.tokenId) {
      idStr = typeof token.tokenId === 'string' ? token.tokenId : String(token.tokenId);
    }
    
    // Check if we have a valid MongoDB ObjectId format (24-character hex string)
    if (idStr && /^[0-9a-fA-F]{24}$/.test(idStr)) {
      console.log("Valid MongoDB ObjectId extracted:", idStr);
      return idStr;
    }
    
    console.warn("Invalid MongoDB ObjectId format:", idStr);
    
    // If we couldn't get a valid ID, log the token for debugging
    console.error("Cannot extract valid ObjectId from token:", token);
  
    return idStr;
  };  

  // Fetch AI valuation data when component mounts
  useEffect(() => {
    const fetchMarketTrend = async () => {
      try {
        const trend = await valuationService.getMarketTrend(30);
        setMarketTrend(trend);
      } catch (error) {
        console.error('Error fetching market trend:', error);
      }
    };

    const fetchPriceRecommendation = async () => {
      if (token.projectId) {
        try {
          const projectId = extractId(token.projectId);
          const recommendation = await valuationService.getPriceRecommendation(projectId);
          setPriceRecommendation(recommendation);
        } catch (error) {
          console.error('Error fetching price recommendation:', error);
        }
      }
    };

    fetchMarketTrend();
    fetchPriceRecommendation();
  }, [token.projectId]);

  const handleBuyClick = () => {
    setShowBuyForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Get and validate token ID
      const tokenId = getTokenId();
      console.log("Token data:", token);
      console.log("Extracted token ID:", tokenId);
      
      // Validate MongoDB ObjectId format
      if (!tokenId || !/^[0-9a-fA-F]{24}$/.test(tokenId)) {
        console.error("Invalid MongoDB ObjectId format:", tokenId);
        alert("Error: Invalid token ID format. Please try again.");
        return;
      }
      
      if (onBuy) {
        console.log("Executing purchase with ID:", tokenId, "Amount:", buyAmount);
        await onBuy(tokenId, buyAmount);
      }
    } catch (error) {
      console.error("Error during purchase:", error);
      alert("Purchase failed. Please try again later.");
    } finally {
      setLoading(false);
      setShowBuyForm(false);
      setBuyAmount(1);
    }
  };

  const getProjectTypeIcon = (type?: string) => {
    // If type is undefined or null, return a default icon
    if (!type) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    // Proceed with the normal switch statement for valid types
    switch (type.toLowerCase()) {
      case 'reforestation':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'solar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'wind':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  // Format date in a human-readable way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const totalCost = buyAmount * (token.price || 0);
  
  // Determine if token is a good value based on AI recommendation
  const isPriceGood = priceRecommendation && token.price <= priceRecommendation.recommendedPrice;

  return (
    <Card className={`overflow-hidden h-full flex flex-col relative ${className}`}>
      {/* Token Image */}
      <div className="h-40 bg-gray-200 relative">
        {token.image ? (
          <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary-100">
            {getProjectTypeIcon(token.projectType)}
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-white bg-opacity-80 text-xs font-medium text-gray-800">
            <span className="mr-1">{token.amount || token.remaining || 0}</span>
            Credits Available
          </span>
        </div>
        {token.verified && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-xs font-medium text-green-800">
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Verified
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4 flex-grow">
        <h3 className="text-lg font-medium text-gray-900 truncate">{token.name}</h3>
        <Link href={`/projects/${extractId(token.projectId)}`}>
          <span className="text-sm text-primary-600 hover:text-primary-500">
            {token.projectName}
          </span>
        </Link>
        
        {/* AI Valuation Integration */}
        {priceRecommendation && (
          <div className="mt-2 p-2 rounded-md bg-gray-50 border border-gray-100 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-gray-600">AI Valuation:</span>
              <span className={`font-medium ${isPriceGood ? 'text-green-600' : 'text-gray-700'}`}>
                ${priceRecommendation.recommendedPrice.toFixed(2)}
              </span>
            </div>
            {isPriceGood && (
              <div className="text-green-600 flex items-center text-xs">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3 w-3 mr-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
                Good value at current price
              </div>
            )}
          </div>
        )}
        
        {/* Market Trend */}
        {marketTrend && (
          <div className="mt-2 flex items-center text-xs">
            <span className="text-gray-600 mr-1">Market Trend:</span>
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
        
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-lg font-semibold text-gray-900">
              ${token.price !== undefined ? token.price.toFixed(2) : '0.00'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Carbon Offset</p>
            <p className="text-lg font-semibold text-gray-900">{token.carbonOffset || '0'} tons</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm text-gray-700">{token.location || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Listed On</p>
            <p className="text-sm text-gray-700">
              {token.createdAt ? formatDate(token.createdAt) : 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 mt-auto">
        {showBuyForm ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label htmlFor={`amount-${getTokenId() || 'temp'}`} className="block text-sm font-medium text-gray-700">
                How many credits do you want to buy?
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="number"
                  name={`amount-${getTokenId() || 'temp'}`}
                  id={`amount-${getTokenId() || 'temp'}`}
                  min="1"
                  max={token.amount || token.remaining || 1}
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(parseInt(e.target.value) || 1)}
                  className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-l-md sm:text-sm border-gray-300"
                  placeholder="1"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  credits
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Total: ${totalCost.toFixed(2)}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth
                isLoading={loading}
                className={buttonClassName}
              >
                Confirm Purchase
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowBuyForm(false);
                  setBuyAmount(1);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex space-x-2">
            {showBuyButton && (
              <Button 
                variant="primary" 
                onClick={handleBuyClick}
                disabled={!isAuthenticated || !accountId}
                fullWidth
                className={buttonClassName}
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
                Buy Credits
              </Button>
            )}
            <Link href={`/projects/${extractId(token.projectId)}`}>
              <Button variant="secondary" fullWidth={!showBuyButton}>
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                View Project
              </Button>
            </Link>
          </div>
        )}
        {!isAuthenticated && showBuyButton && (
          <p className="mt-2 text-xs text-center text-red-600">
            Please login to purchase carbon credits
          </p>
        )}
        {isAuthenticated && !accountId && showBuyButton && (
          <p className="mt-2 text-xs text-center text-red-600">
            Please connect your wallet to purchase carbon credits
          </p>
        )}
      </div>
    </Card>
  );
};