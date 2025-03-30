'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { valuationService } from '@/services/valuationService';

// Sample data structure if needed before real data is available
const SAMPLE_DATA = [
  { date: 'Jan', value: 1000, tokens: 100 },
  { date: 'Feb', value: 1200, tokens: 120 },
  { date: 'Mar', value: 1400, tokens: 140 },
  { date: 'Apr', value: 1100, tokens: 110 },
  { date: 'May', value: 1600, tokens: 160 },
  { date: 'Jun', value: 1800, tokens: 170 },
  { date: 'Jul', value: 2000, tokens: 190 },
];

type TimeRangeOption = '1W' | '1M' | '3M' | '6M' | 'YTD' | '1Y' | 'All';

export const PortfolioChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('3M');
  const [marketData, setMarketData] = useState<Array<{ date: string; price: number }>>([]);
  const [priceProjection, setPriceProjection] = useState<Array<{ date: string; projectedPrice: number }>>([]);
  const [marketTrend, setMarketTrend] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const tokens = useSelector((state: RootState) => state.token.userTokens);
  const tokenValues = useSelector((state: RootState) => state.token.tokens);

  //sample data with real market trends
  const chartData = SAMPLE_DATA;

  const timeRangeOptions: TimeRangeOption[] = ['1W', '1M', '3M', '6M', 'YTD', '1Y', 'All'];

  useEffect(() => {
    fetchMarketData();
  }, [timeRange]);

  const fetchMarketData = async () => {
    setIsLoading(true);
    try {
      // Get market price history
      let days = 30; // Default for 1M
      
      switch(timeRange) {
        case '1W': days = 7; break;
        case '1M': days = 30; break;
        case '3M': days = 90; break;
        case '6M': days = 180; break;
        case 'YTD': 
          const now = new Date();
          const start = new Date(now.getFullYear(), 0, 1);
          days = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          break;
        case '1Y': days = 365; break;
        case 'All': days = 730; break; // 2 years as "All"
      }
      
      const history = await valuationService.getMarketPriceHistory(undefined, days);
      setMarketData(history);
      
      // Get market trend
      const trend = await valuationService.getMarketTrend(days);
      setMarketTrend(trend);
      
      // Generate price projection for the next 30 days
      const today = new Date();
      const forecast: Array<{ date: string; projectedPrice: number }> = [];
      
      // Base the projection on the trend
      const trendFactor = trend.trend === 'rising' ? 1.001 : 
                        trend.trend === 'falling' ? 0.999 : 1.0;
      
      let lastPrice = history.length > 0 ? history[history.length - 1].price : 20;
      
      for (let i = 1; i <= 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        // Apply trend and some randomness
        lastPrice = lastPrice * trendFactor * (0.995 + Math.random() * 0.01);
        
        forecast.push({
          date: date.toISOString().split('T')[0],
          projectedPrice: Math.round(lastPrice * 100) / 100
        });
      }
      
      setPriceProjection(forecast);
      
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Combine portfolio data with market data
  const combinedData = chartData.map((item, index) => {
    const marketItem = marketData[index] || {};
    return {
      ...item,
      marketPrice: marketItem.price
    };
  });
  
  // Calculate portfolio performance metrics
  const calculatePerformanceMetrics = () => {
    if (!marketData || marketData.length < 2) return { change: 0, trend: 'stable' };
    
    const startPrice = marketData[0].price;
    const endPrice = marketData[marketData.length - 1].price;
    const change = ((endPrice - startPrice) / startPrice) * 100;
    
    let trend = 'stable';
    if (change > 2) trend = 'rising';
    else if (change < -2) trend = 'falling';
    
    return { change, trend };
  };
  
  const metrics = calculatePerformanceMetrics();
  
  // Get today's date for reference line
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          {marketTrend && (
            <div className="flex items-center">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                marketTrend.trend === 'rising' 
                  ? 'bg-green-100 text-green-800' 
                  : marketTrend.trend === 'falling' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-gray-100 text-gray-800'
              }`}>
                {marketTrend.trend === 'rising' && '↑ '}
                {marketTrend.trend === 'falling' && '↓ '}
                {Math.abs(marketTrend.changePercent).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600">
                Carbon credit market is {marketTrend.trend}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-1">
          {timeRangeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setTimeRange(option)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                timeRange === option
                  ? 'bg-gradient-to-r from-red-800 to-yellow-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
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
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[...marketData, ...priceProjection.map(item => ({ date: item.date, price: null, projectedPrice: item.projectedPrice }))]}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
                ticks={marketData.filter((_, i) => i % Math.ceil(marketData.length / 6) === 0).map(item => item.date).concat(
                  priceProjection.filter((_, i) => i % Math.ceil(priceProjection.length / 3) === 0).map(item => item.date)
                )}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  borderRadius: '0.5rem',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  padding: '0.75rem'
                }} 
                formatter={(value, name) => {
                  if (name === 'price') return [`$${value}`, 'Market Price'];
                  if (name === 'projectedPrice') return [`$${value}`, 'Projected Price'];
                  return [value, name];
                }}
                labelFormatter={(label) => {
                  const date = new Date(label);
                  return `Date: ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
                }}
                cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
              />
              <Legend
                formatter={(value) => {
                  if (value === 'price') return 'Market Price';
                  if (value === 'projectedPrice') return 'Projected Price';
                  return value;
                }}
                wrapperStyle={{ paddingTop: '10px' }}
              />
              <ReferenceLine x={today} yAxisId="left" stroke="#666" strokeDasharray="3 3" label={{ value: 'Today', position: 'insideTopRight', fill: '#666', fontSize: 12 }} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#800020"
                strokeWidth={3}
                dot={{ r: 0 }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#800020' }}
                connectNulls
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="projectedPrice"
                stroke="#B8860B"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 0 }}
                activeDot={{ r: 8, strokeWidth: 0, fill: '#B8860B' }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {marketTrend && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Average Price</p>
            <p className="text-lg font-semibold text-gray-900">${marketTrend.averagePrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Volatility</p>
            <p className="text-lg font-semibold text-gray-900">{marketTrend.volatility.toFixed(1)}%</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">AI Forecast</p>
            <p className={`text-lg font-semibold ${
              marketTrend.trend === 'rising' ? 'text-green-600' : 
              marketTrend.trend === 'falling' ? 'text-red-600' : 'text-gray-900'
            }`}>
              {marketTrend.trend === 'rising' ? '↑ Bullish' : 
               marketTrend.trend === 'falling' ? '↓ Bearish' : '→ Stable'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};