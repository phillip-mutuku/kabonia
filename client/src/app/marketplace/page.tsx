'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getListings, executePurchase } from '@/store/slices/marketSlice';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TokenCard } from '@/components/marketplace/TokenCard';
import { Card } from '@/components/common/Card';
import { OrderBook } from '@/components/marketplace/OrderBook';
import { TransactionHistory } from '@/components/marketplace/TransactionHistory';
import { BuySellForm } from '@/components/marketplace/BuySellForm';
import { useSearchParams, useRouter } from 'next/navigation';
import { Listing } from '@/types/market';

  // Define our custom color scheme
const colors = {
  maroon: {
    50: '#fdf2f2',
    100: '#f9d6d6',
    200: '#f0abab',
    300: '#e77f7f',
    400: '#d95454',
    500: '#800020',
    600: '#700020',
    700: '#600020',
    800: '#500020',
    900: '#400020',
  },
  gold: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#b8860b',
    600: '#996c0a',
    700: '#7a5309',
    800: '#623b08',
    900: '#4d2c06',
  }
};

export default function MarketplacePage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams ? searchParams.get('projectId') : null;
  
  const { listings, isLoading, error } = useSelector((state: RootState) => state.market);
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    projectType: 'all',
    verified: false,
    search: '',
    projectId: projectIdParam || '',
  });
  const [showOrderBook, setShowOrderBook] = useState(false);
  const [showBuySellModal, setShowBuySellModal] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [buySellMode, setBuySellMode] = useState<'buy' | 'sell'>('buy');

  useEffect(() => {
    dispatch(getListings({}) as any);
  }, [dispatch]);

  // Update filter when projectId in URL changes
  useEffect(() => {
    if (projectIdParam) {
      setFilters(prev => ({
        ...prev,
        projectId: projectIdParam
      }));
    }
  }, [projectIdParam]);

  // Filter tokens based on selected filters
  const filteredListings = listings.filter((listing: Listing) => {
    const matchesPrice =
      (filters.priceMin === '' || listing.price >= parseFloat(filters.priceMin)) &&
      (filters.priceMax === '' || listing.price <= parseFloat(filters.priceMax));
    
    const matchesType = filters.projectType === 'all' || 
      (listing.projectType && listing.projectType.toLowerCase() === filters.projectType.toLowerCase());
    
    const matchesVerified = !filters.verified || listing.verified;
    
    const matchesSearch = filters.search === '' || 
      listing.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      listing.projectName.toLowerCase().includes(filters.search.toLowerCase()) ||
      (listing.location && listing.location.toLowerCase().includes(filters.search.toLowerCase()));
    
    // Filter by project ID if specified
    const matchesProject = !filters.projectId || listing.projectId === filters.projectId;
    
    return matchesPrice && matchesType && matchesVerified && matchesSearch && matchesProject;
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Clear project filter and update URL
  const clearProjectFilter = () => {
    setFilters(prev => ({
      ...prev,
      projectId: ''
    }));
    
    router.push('/marketplace');
  };


  const handleBuyToken = (tokenId: string, amount: number): void => {
    if (!tokenId) {
      console.error("Missing token ID");
      return;
    }

    const formattedId = String(tokenId);
    
    // Log for debugging
    console.log("About to purchase token with ID:", formattedId, "Amount:", amount);
    
    // Check for valid MongoDB ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(formattedId)) {
      console.error("Invalid MongoDB ObjectId format:", formattedId);
      return;
    }
    
    // Execute the purchase
    dispatch(executePurchase({
      listingId: formattedId,
      amount: amount || 1
    }) as any)
      .unwrap()
      .then((result: any) => {
        console.log("Purchase successful:", result);
        
        // Refresh listings
        dispatch(getListings({}) as any);
      })
      .catch((error: any) => {
        console.error("Purchase failed:", error);
      });
  };
  
  const handleSellCredits = () => {
    setBuySellMode('sell');
    setShowBuySellModal(true);
  };
  
  const handleBuySellComplete = () => {
    setShowBuySellModal(false);
    setSelectedToken(null);
    // Refresh listings after transaction
    dispatch(getListings({}) as any);
  };

  const projectTypes = ['Reforestation', 'Solar', 'Wind', 'Conservation', 'Methane Capture'];

  return (
    <DashboardLayout>
      <div className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Carbon Credit Marketplace</h2>
            <p className="mt-2 text-base text-gray-600">
              Buy and sell carbon credits from verified projects.
            </p>
            
            {/* Show indicator when filtered by project */}
            {filters.projectId && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-maroon-50 text-maroon-700 border border-maroon-200">
                Showing credits for specific project
                <button 
                  onClick={clearProjectFilter}
                  className="ml-2 inline-flex text-maroon-500 hover:text-maroon-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setShowOrderBook(!showOrderBook)}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors duration-200 ${
                showOrderBook 
                  ? 'bg-maroon-600 text-black border-maroon-600 hover:bg-maroon-700' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-maroon-600'
              }`}
            >
              <svg
                className={`-ml-1 mr-2 h-5 w-5 ${showOrderBook ? 'text-black' : 'text-gray-500'}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {showOrderBook ? 'Hide Order Book' : 'Show Order Book'}
            </button>
            <button
              onClick={handleSellCredits}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-maroon-600 hover:bg-maroon-700 transition-colors duration-200 ml-2"
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
            </button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 shadow-md border border-gray-100 rounded-lg">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="focus:ring-maroon-500 focus:border-maroon-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                  placeholder="Search credits or projects"
                />
              </div>
            </div>
            <div>
              <label htmlFor="priceMin" className="block text-sm font-medium text-gray-700">
                Min Price ($)
              </label>
              <input
                type="number"
                name="priceMin"
                id="priceMin"
                min="0"
                value={filters.priceMin}
                onChange={handleFilterChange}
                className="mt-1 focus:ring-maroon-500 focus:border-maroon-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="priceMax" className="block text-sm font-medium text-gray-700">
                Max Price ($)
              </label>
              <input
                type="number"
                name="priceMax"
                id="priceMax"
                min="0"
                value={filters.priceMax}
                onChange={handleFilterChange}
                className="mt-1 focus:ring-maroon-500 focus:border-maroon-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Any"
              />
            </div>
            <div>
              <label htmlFor="projectType" className="block text-sm font-medium text-gray-700">
                Project Type
              </label>
              <select
                id="projectType"
                name="projectType"
                value={filters.projectType}
                onChange={handleFilterChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-maroon-500 focus:border-maroon-500 sm:text-sm rounded-md"
              >
                <option value="all">All Types</option>
                {projectTypes.map((type) => (
                  <option key={type} value={type.toLowerCase()}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center h-5">
                <input
                  id="verified"
                  name="verified"
                  type="checkbox"
                  checked={filters.verified}
                  onChange={handleFilterChange}
                  className="focus:ring-maroon-500 h-4 w-4 text-maroon-600 border-gray-300 rounded"
                />
                <label htmlFor="verified" className="ml-2 text-sm text-gray-700">
                  Verified Only
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Order Book (Conditionally Shown) */}
        {showOrderBook && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full shadow-md border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 bg-maroon-50 border-b border-maroon-100">
                  <h3 className="text-lg font-medium text-maroon-900">Order Book</h3>
                </div>
                <div className="p-4">
                  <OrderBook />
                </div>
              </Card>
            </div>
            <div>
              <Card className="h-full shadow-md border border-gray-100 rounded-lg overflow-hidden">
                <div className="p-4 bg-gold-50 border-b border-gold-100">
                  <h3 className="text-lg font-medium text-gold-800">Transaction History</h3>
                </div>
                <div className="p-4">
                  <TransactionHistory />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tokens Grid */}
        {isLoading ? (
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
        ) : error ? (
          <Card className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-md">
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
              <h3 className="ml-3 text-lg font-medium text-red-800">Error loading marketplace listings</h3>
            </div>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => dispatch(getListings({}) as any)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </Card>
        ) : filteredListings.length === 0 ? (
          <Card className="p-8 shadow-md border border-gray-100 rounded-lg">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No carbon credits found</h3>
              <p className="mt-2 text-base text-gray-500 max-w-md mx-auto">
                {filters.projectId 
                  ? "There are no credits available for this project yet. Check back later or try minting some credits."
                  : "Try adjusting your filters or check back later for new listings."}
              </p>
              <div className="mt-6">
                {filters.projectId ? (
                  <div className="space-y-3">
                    <button
                      onClick={clearProjectFilter}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 transition-colors duration-200"
                    >
                      View All Credits
                    </button>
                    <div>
                      <a
                        href={`/tokens/mint?project=${filters.projectId}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-maroon-600 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 transition-colors duration-200"
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
                        Mint Credits
                      </a>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleSellCredits}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-black bg-maroon-800 hover:bg-maroon-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon-500 transition-colors duration-200"
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
                    Sell Your Credits
                  </button>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
         {filteredListings.map((token) => (
          <TokenCard 
            key={token._id || token.tokenId} 
            token={token} 
            onBuy={handleBuyToken}
            className="transform transition hover:shadow-xl hover:-translate-y-1 border border-gray-100 rounded-lg overflow-hidden"
            buttonClassName="bg-maroon-600 hover:bg-maroon-700 focus:ring-maroon-500"
            accentColor={colors.gold[500]}
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
                  {buySellMode === 'buy' ? 'Buy Carbon Credits' : 'Sell Carbon Credits'}
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
                  initialMode={buySellMode}
                  prefilledAmount={1}
                  prefilledPrice={selectedToken?.price}
                  maxAmount={selectedToken?.available || 100}
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