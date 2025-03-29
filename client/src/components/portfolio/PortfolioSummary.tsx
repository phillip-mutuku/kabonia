'use client';

import React from 'react';
import { Card } from '@/components/common/Card';

interface PortfolioSummaryProps {
  totalTokens: number;
  totalValue: number;
  totalCarbonOffset: number;
  tokensLoading: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  totalTokens,
  totalValue,
  totalCarbonOffset,
  tokensLoading
}) => {
  // Sample impact equivalents
  const treesPlantedEquivalent = Math.round(totalCarbonOffset * 1.2);
  const carsMileageEquivalent = Math.round(totalCarbonOffset * 2404);
  const homesEquivalent = (totalCarbonOffset * 0.12).toFixed(1);

  return (
    <Card className="overflow-hidden">
      {tokensLoading ? (
        <div className="flex justify-center py-6">
          <svg
            className="animate-spin h-10 w-10 text-primary-600"
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
        <div>
          <div className="p-6 bg-gradient-to-r from-primary-600 to-secondary-600 sm:px-8">
            <div className="text-green-600">
              <h3 className="text-lg font-semibold">Portfolio Value</h3>
              <div className="mt-2 text-3xl font-bold">${totalValue.toFixed(2)}</div>
              <div className="mt-1 text-sm opacity-90">{totalTokens} Carbon Credits</div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Carbon Footprint Reduction Progress</h4>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-primary-200">
                  <div
                    style={{ width: `${Math.min(totalCarbonOffset / 10, 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-600"
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0 tons</span>
                  <span>Goal: 10 tons</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-600">
                You've offset {totalCarbonOffset.toFixed(2)} tons of CO₂, which is equivalent to{' '}
                {Math.round((totalCarbonOffset / 10) * 100)}% of the average person's annual carbon footprint.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Want to increase your impact?</h4>
                <p className="mt-1 text-xs text-gray-500">
                  Purchase more carbon credits to offset your footprint.
                </p>
              </div>
              <a 
                href="/marketplace" 
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-black bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Buy Credits
              </a>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};