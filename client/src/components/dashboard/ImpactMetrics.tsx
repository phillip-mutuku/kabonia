'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { valuationService } from '@/services/valuationService';

// Sample data for different project types
const SAMPLE_DATA = [
  { name: 'Reforestation', value: 45, color: '#056835' },
  { name: 'Solar Energy', value: 25, color: '#FFB30F' },
  { name: 'Wind Power', value: 15, color: '#64A8DD' },
  { name: 'Methane Capture', value: 10, color: '#BF800F' },
  { name: 'Conservation', value: 5, color: '#800020' },
];

export const ImpactMetrics: React.FC = () => {
  const projects = useSelector((state: RootState) => state.project.projects);
  const [marketTrend, setMarketTrend] = useState<any>(null);
  const [priceHistory, setPriceHistory] = useState<Array<{ date: string; price: number }>>([]);
  const [projectTypePerformance, setProjectTypePerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  //sample data
  const impactData = SAMPLE_DATA;
  
  useEffect(() => {
    fetchValuationData();
  }, []);
  
  const fetchValuationData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch market trend data
      const trend = await valuationService.getMarketTrend(30);
      setMarketTrend(trend);
      
      // Fetch price history for the chart
      const history = await valuationService.getMarketPriceHistory(undefined, 30);
      setPriceHistory(history);
      
      // Fetch project type performance
      const performance = await valuationService.getProjectTypePerformance();
      setProjectTypePerformance(performance);
    } catch (error) {
      console.error("Error fetching valuation data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total carbon offset
  const totalOffset = impactData.reduce((sum, item) => sum + item.value, 0);
  const formattedTotal = Math.round(totalOffset * 100) / 100;

  // Calculate equivalent metrics
  const treesPlantedEquivalent = (totalOffset * 1.2).toFixed(0);
  const carsMileageEquivalent = (totalOffset * 2404).toFixed(0);
  const homesEquivalent = (totalOffset * 0.12).toFixed(1);
  
  // Format date for price history chart
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full h-full">
      <div className="flex flex-col h-full space-y-6">
        <div className="flex-1 flex flex-col md:flex-row gap-6">
          {/* Carbon Offset by Project Type */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Carbon Offset by Project Type</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={impactData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {impactData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} tons`, 'Carbon Offset']}
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '0.375rem',
                      border: 'none',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                      padding: '0.5rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Market Price Trend */}
          <div className="flex-1 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Carbon Credit Market Price</h3>
              {marketTrend && (
                <div className={`text-xs font-medium rounded-full px-2 py-1 ${
                  marketTrend.trend === 'rising' 
                    ? 'bg-green-100 text-green-800' 
                    : marketTrend.trend === 'falling' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-gray-100 text-gray-800'
                }`}>
                  {marketTrend.trend === 'rising' && '↑ '}
                  {marketTrend.trend === 'falling' && '↓ '}
                  {marketTrend.trend.charAt(0).toUpperCase() + marketTrend.trend.slice(1)} 
                  ({Math.abs(marketTrend.changePercent).toFixed(1)}%)
                </div>
              )}
            </div>
            
            <div className="h-56">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <svg className="animate-spin h-8 w-8 text-maroon-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : priceHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      ticks={priceHistory.filter((_, i) => i % 5 === 0).map(item => item.date)}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => `$${value}`} 
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Price']}
                      labelFormatter={formatDate}
                      contentStyle={{
                        backgroundColor: 'white',
                        borderRadius: '0.375rem',
                        border: 'none',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        padding: '0.5rem',
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#800020" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 6 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-gray-500">No price data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-primary-700">{formattedTotal}</div>
            <div className="text-xs text-gray-500">tons CO2 offset</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-secondary-700">{treesPlantedEquivalent}</div>
            <div className="text-xs text-gray-500">trees planted</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-primary-700">{carsMileageEquivalent}</div>
            <div className="text-xs text-gray-500">miles not driven</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 text-center">
            <div className="text-2xl font-bold text-secondary-700">{homesEquivalent}</div>
            <div className="text-xs text-gray-500">homes powered</div>
          </div>
        </div>
        
        {/* Project Type Performance */}
        {projectTypePerformance && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Project Type Market Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(projectTypePerformance).map(([type, data]: [string, any]) => (
                <div key={type} className="bg-gray-50 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ 
                      backgroundColor: type === 'reforestation' ? '#056835' : 
                                      type === 'conservation' ? '#800020' : 
                                      type === 'renewable_energy' ? '#FFB30F' : 
                                      type === 'methane_capture' ? '#BF800F' : '#64A8DD'
                    }}></div>
                    <span className="text-sm font-medium text-gray-800">
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Avg. Price:</span>
                      <span className="font-medium">${data.averagePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-gray-500">Trend:</span>
                      <span className={
                        data.trend === 'rising' ? 'text-green-600' :
                        data.trend === 'falling' ? 'text-red-600' :
                        'text-gray-600'
                      }>
                        {data.trend === 'rising' ? '↑ ' : data.trend === 'falling' ? '↓ ' : ''}
                        {Math.abs(data.changePercent).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};