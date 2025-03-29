'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from '@/components/common/Card';

// Sample order book data structure
type OrderType = 'buy' | 'sell';

interface Order {
  id: string;
  type: OrderType;
  price: number;
  amount: number;
  total: number;
  createdAt: string;
  projectType?: string;
  projectName?: string;
}

// Sample data
const SAMPLE_ORDERS: Order[] = [
  { id: '1', type: 'sell', price: 15.50, amount: 50, total: 775, createdAt: '2023-03-24T10:30:00Z', projectType: 'Reforestation', projectName: 'Amazon Rainforest Project' },
  { id: '2', type: 'sell', price: 16.25, amount: 25, total: 406.25, createdAt: '2023-03-24T11:45:00Z', projectType: 'Solar', projectName: 'Solar Farm Kenya' },
  { id: '3', type: 'sell', price: 17.00, amount: 15, total: 255, createdAt: '2023-03-24T12:00:00Z', projectType: 'Wind', projectName: 'Wind Farm Project' },
  { id: '4', type: 'sell', price: 18.50, amount: 10, total: 185, createdAt: '2023-03-24T13:15:00Z', projectType: 'Conservation', projectName: 'Wildlife Conservation Initiative' },
  { id: '5', type: 'buy', price: 15.00, amount: 30, total: 450, createdAt: '2023-03-24T09:00:00Z' },
  { id: '6', type: 'buy', price: 14.75, amount: 20, total: 295, createdAt: '2023-03-24T09:30:00Z' },
  { id: '7', type: 'buy', price: 14.50, amount: 45, total: 652.5, createdAt: '2023-03-24T08:45:00Z' },
  { id: '8', type: 'buy', price: 14.25, amount: 35, total: 498.75, createdAt: '2023-03-24T08:15:00Z' },
];

export const OrderBook: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'sell'>('all');
  // In a real app, orders would come from the Redux store
  // const { orders } = useSelector((state: RootState) => state.market);
  
  // For now, we'll use sample data
  const orders = SAMPLE_ORDERS;
  
  // Filter orders based on the active tab
  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.type === activeTab);
  
  // Sort orders: sells descending, buys ascending
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.type === 'sell' && b.type === 'sell') {
      return a.price - b.price; // Ascending for sell orders (lowest first)
    } else if (a.type === 'buy' && b.type === 'buy') {
      return b.price - a.price; // Descending for buy orders (highest first)
    } else if (a.type === 'sell' && b.type === 'buy') {
      return -1; // Sell orders first
    } else {
      return 1; // Buy orders after
    }
  });

  // Format date in a readable way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`${
              activeTab === 'buy'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Buy Orders
          </button>
          <button
            onClick={() => setActiveTab('sell')}
            className={`${
              activeTab === 'sell'
                ? 'border-red-500 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm`}
          >
            Sell Orders
          </button>
        </nav>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {activeTab === 'all' && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Price (USD)
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total
              </th>
              {(activeTab === 'all' || activeTab === 'sell') && (
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Project
                </th>
              )}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedOrders.map((order) => (
              <tr key={order.id}>
                {activeTab === 'all' && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        order.type === 'buy'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.type === 'buy' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span 
                    className={`text-sm font-medium ${
                      order.type === 'buy' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ${order.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.amount} credits
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${order.total.toFixed(2)}
                </td>
                {(activeTab === 'all' || activeTab === 'sell') && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.type === 'sell' && order.projectName ? (
                      <div>
                        <div className="font-medium text-gray-900">{order.projectName}</div>
                        {order.projectType && (
                          <div className="text-xs text-gray-500">{order.projectType}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {sortedOrders.length === 0 && (
        <div className="py-12 text-center">
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
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'buy'
              ? 'No buy orders currently in the order book.'
              : activeTab === 'sell'
              ? 'No sell orders currently in the order book.'
              : 'No orders currently in the order book.'}
          </p>
        </div>
      )}
    </Card>
  );
};