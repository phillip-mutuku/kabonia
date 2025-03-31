'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getUserTokens } from '@/store/slices/tokenSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import Link from 'next/link';
import { TokenBalance, TokenStatus } from '@/types/token';
import { BuySellForm } from '@/components/marketplace/BuySellForm';


const extractId = (idField: any): string => {
  if (!idField) return '';
  if (typeof idField === 'object' && idField._id) {
    return idField._id;
  }
  if (typeof idField === 'object' && idField.id) {
    return idField.id;
  }
  return String(idField);
};

export default function TokensPage() {
  const dispatch = useDispatch();
  const { userTokens, isLoading, error } = useSelector((state: RootState) => state.token);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterProjectType, setFilterProjectType] = useState<string>('all');
  const [showBuySellModal, setShowBuySellModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);

  useEffect(() => {
    dispatch(getUserTokens() as any);
  }, [dispatch]);

  // Get unique project types from tokens
  const projectTypes = [...new Set(userTokens
    .filter(token => token.projectType)
    .map(token => token.projectType))];

  // Filter tokens based on selected filters
  const filteredTokens = userTokens.filter(token => {
    if (filterStatus !== 'all' && token.status !== filterStatus) return false;
    if (filterProjectType !== 'all' && token.projectType !== filterProjectType) return false;
    return true;
  });

  const handleSellToken = (token: TokenBalance) => {
    setSelectedToken(token);
    setShowBuySellModal(true);
  };

  const handleBuySellComplete = () => {
    setShowBuySellModal(false);
    setSelectedToken(null);
    // Refresh the token list
    dispatch(getUserTokens() as any);
  };

  const handleSellCredits = () => {
    // Open modal with no token pre-selected
    setSelectedToken(null);
    setShowBuySellModal(true);
  };



  const getTotalAvailableTokens = () => {
    return userTokens.reduce((total, token) => total + (token.balance || 0), 0);
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Carbon Credits</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and trade your carbon credits
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Button 
              variant="primary" 
              onClick={handleSellCredits}
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Sell Credits
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <Card className="p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="filterStatus" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="filterStatus"
                name="filterStatus"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option key="all-statuses" value="all">All Statuses</option>
                <option key="available" value={TokenStatus.AVAILABLE}>Available</option>
                <option key="listed" value={TokenStatus.LISTED}>Listed</option>
                <option key="retired" value={TokenStatus.RETIRED}>Retired</option>
              </select>
            </div>
            <div>
              <label htmlFor="filterProjectType" className="block text-sm font-medium text-gray-700">
                Project Type
              </label>
              <select
                id="filterProjectType"
                name="filterProjectType"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm rounded-md"
                value={filterProjectType}
                onChange={(e) => setFilterProjectType(e.target.value)}
              >
                <option key="all-types" value="all">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

            </div>
          </div>
        </Card>
        
        {/* Token Cards */}
        {isLoading ? (
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
        ) : error ? (
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
              <h3 className="ml-3 text-lg font-medium text-red-800">Error loading tokens</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => dispatch(getUserTokens() as any)}
                variant="secondary"
                className="bg-maroon-600 hover:bg-maroon-700 text-white"
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : userTokens.length === 0 ? (
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
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No carbon credits</h3>
              <p className="mt-1 text-sm text-gray-500">
                You don't have any carbon credits yet. Mint some from your verified projects.
              </p>
              <div className="mt-6">
              <Link href="/projects">
                <Button 
                  variant="primary"
                  className="bg-maroon-600 hover:bg-maroon-700 text-white"
                >
                  View Your Projects
                </Button>
              </Link>
              </div>
            </div>
          </Card>
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
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No matching credits</h3>
              <p className="mt-1 text-sm text-gray-500">
                No carbon credits match your selected filters. Try adjusting your filters.
              </p>
              <div className="mt-6">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    setFilterStatus('all');
                    setFilterProjectType('all');
                  }}
                  className="bg-maroon-600 hover:bg-maroon-700 text-white"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTokens.map((token) => (
              <TokenCard 
                key={token.tokenId} 
                token={token} 
                onSellClick={() => handleSellToken(token)}
              />
            ))}
          </div>
        )}

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
                tokenId={selectedToken?.tokenId || selectedToken?._id}
                initialMode="sell"
                prefilledAmount={1}
                prefilledPrice={selectedToken?.price}
                maxAmount={selectedToken?.balance || getTotalAvailableTokens()}
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

// Token Card Component
interface TokenCardProps {
  token: TokenBalance;
  onSellClick: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ token, onSellClick }) => {
  // Function to display appropriate badge based on token status
  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    let badgeColor = '';
    let badgeText = status;
    
    switch (status) {
      case TokenStatus.AVAILABLE:
        badgeColor = 'bg-green-100 text-green-800';
        badgeText = 'Available';
        break;
      case TokenStatus.LISTED:
        badgeColor = 'bg-blue-100 text-blue-800';
        badgeText = 'Listed';
        break;
      case TokenStatus.RETIRED:
        badgeColor = 'bg-gray-100 text-gray-800';
        badgeText = 'Retired';
        break;
      case TokenStatus.TRANSFERRING:
        badgeColor = 'bg-yellow-100 text-yellow-800';
        badgeText = 'Transferring';
        break;
      case TokenStatus.MINTED:
        badgeColor = 'bg-purple-100 text-purple-800';
        badgeText = 'Minted';
        break;
      default:
        badgeColor = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
        {badgeText}
      </span>
    );
  };

  // Project type icon
  const getProjectTypeIcon = (type: string) => {
    if (!type) {
      return (
        <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    switch (type.toLowerCase()) {
      case 'reforestation':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'solar':
        return (
          <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'wind':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      case 'conservation':
        return (
          <svg className="h-5 w-5 text-green-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
      {/* Token Header */}
      <div className="h-40 bg-gray-200 relative">
        {token.image ? (
          <img 
            src={token.image} 
            alt={token.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-maroon-50">
            {getProjectTypeIcon(token.projectType)}
          </div>
        )}
       <div className="absolute top-2 right-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full bg-white bg-opacity-80 text-xs font-medium text-gray-800">
          <span className="mr-1">{token.balance}</span> 
          Credits
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
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 truncate">{token.name}</h3>
          {token.status && getStatusBadge(token.status as string)}
        </div>
        
        <Link href={`/projects/${extractId(token.projectId)}`}>
        <span className="text-sm text-maroon-600 hover:text-maroon-500">
          {token.projectName}
        </span>
      </Link>
        
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-lg font-semibold text-gray-900">
            ${token.price !== undefined ? token.price.toFixed(2) : '0.00'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Carbon Offset</p>
          <p className="text-lg font-semibold text-gray-900">
            {token.carbonOffset !== undefined ? token.carbonOffset : '0'} tons
          </p>
        </div>
        {token.location && (
          <div className="col-span-2">
            <p className="text-xs text-gray-500">Location</p>
            <p className="text-sm text-gray-700">{token.location}</p>
          </div>
        )}
      </div>
      </div>
      
      {/* Actions */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 mt-auto">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="primary"
            fullWidth
            onClick={onSellClick}
            className="bg-maroon-600 hover:bg-maroon-700 text-white"
          >
            <svg
              className="-ml-1 mr-1 h-4 w-4"
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
            Sell
          </Button>
          <Link href={`/tokens/${extractId(token.tokenId)}`}>
          <Button
            variant="secondary"
            fullWidth
            className="border border-gray-300 hover:bg-gray-100"
          >
              <svg
                className="-ml-1 mr-1 h-4 w-4"
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
              Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};