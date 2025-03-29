'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/common/Card';

interface Token {
  _id: string;
  projectType: string;
  amount: number;
  price: number;
}

interface TokensBreakdownProps {
  tokens: Token[];
  loading: boolean;
}

export const TokensBreakdown: React.FC<TokensBreakdownProps> = ({ tokens, loading }) => {
  // Group tokens by project type
  const tokensBreakdown = tokens.reduce((acc: Record<string, { amount: number, value: number, color: string }>, token) => {
    // Skip tokens with undefined projectType
    if (!token.projectType) return acc;
    
    const type = token.projectType;
    
    if (!acc[type]) {
      acc[type] = {
        amount: 0,
        value: 0,
        color: getColorForType(type)
      };
    }
    
    // Also check for undefined amount and price
    acc[type].amount += token.amount || 0;
    acc[type].value += (token.amount || 0) * (token.price || 0);
    
    return acc;
  }, {});

  const chartData = Object.entries(tokensBreakdown).map(([name, data]) => ({
    name,
    value: data.amount,
    color: data.color
  }));

  // Calculate total value
  const totalAmount = Object.values(tokensBreakdown).reduce((sum, data) => sum + data.amount, 0);

  // Get color for project type
  function getColorForType(type?: string): string {
    if (!type) return '#718096';
    
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
      case 'reforestation':
        return '#056835';
      case 'solar':
        return '#FFB30F';
      case 'wind':
        return '#64A8DD';
      case 'conservation':
        return '#800020'; 
      case 'methane capture':
        return '#BF800F';
      default:
        return '#718096';
  }
}

  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Portfolio Breakdown</h3>
      </div>
      {loading ? (
        <div className="flex justify-center py-8">
          <svg
            className="animate-spin h-8 w-8 text-primary-600"
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
      ) : chartData.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-gray-500">No carbon credits in your portfolio yet.</p>
        </div>
      ) : (
        <div className="px-4 py-5 sm:p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  labelLine={false}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} credits`, 'Amount']}
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
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Distribution by Project Type</h4>
            <div className="space-y-2">
              {Object.entries(tokensBreakdown).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: data.color }}
                    ></div>
                    <span className="text-sm text-gray-600">{type}</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-medium text-gray-900">{data.amount}</span>
                    <span className="text-gray-500"> ({((data.amount / totalAmount) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};