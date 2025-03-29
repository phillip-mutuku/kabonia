'use client';

import React from 'react';
import { Card } from '@/components/common/Card';

// Sample transaction history data structure
interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  timestamp: string;
  buyer?: string;
  seller?: string;
  projectName?: string;
}

// Sample data
const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx1',
    type: 'buy',
    price: 15.75,
    amount: 20,
    total: 315,
    timestamp: '2023-03-24T14:30:00Z',
    buyer: '0.0.1234',
    seller: '0.0.5678',
    projectName: 'Amazon Rainforest Project'
  },
  {
    id: 'tx2',
    type: 'sell',
    price: 16.25,
    amount: 15,
    total: 243.75,
    timestamp: '2023-03-24T13:45:00Z',
    buyer: '0.0.9012',
    seller: '0.0.3456',
    projectName: 'Solar Farm Kenya'
  },
  {
    id: 'tx3',
    type: 'buy',
    price: 17.50,
    amount: 10,
    total: 175,
    timestamp: '2023-03-24T12:15:00Z',
    buyer: '0.0.7890',
    seller: '0.0.1234',
    projectName: 'Wind Farm Project'
  },
  {
    id: 'tx4',
    type: 'sell',
    price: 14.90,
    amount: 25,
    total: 372.5,
    timestamp: '2023-03-24T10:00:00Z',
    buyer: '0.0.5678',
    seller: '0.0.9012',
    projectName: 'Methane Capture Initiative'
  },
  {
    id: 'tx5',
    type: 'buy',
    price: 15.25,
    amount: 30,
    total: 457.5,
    timestamp: '2023-03-24T09:30:00Z',
    buyer: '0.0.3456',
    seller: '0.0.7890',
    projectName: 'Conservation Project'
  }
];

export const TransactionHistory: React.FC = () => {
  // In a real app, transactions would come from the Redux store
  // const { transactions } = useSelector((state: RootState) => state.market);
  
  // For now, we'll use sample data
  const transactions = SAMPLE_TRANSACTIONS;
  
  // Sort transactions by timestamp, most recent first
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Format date in a human-readable way
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

  // Format account ID for display
  const formatAccount = (accountId?: string): string => {
    if (!accountId) return '—';
    return accountId.length > 8 ? `${accountId.slice(0, 4)}...${accountId.slice(-4)}` : accountId;
  };

  return (
    <Card className="h-full">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Transactions</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Latest carbon credit trades on the marketplace.
        </p>
      </div>
      <div className="overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {sortedTransactions.map((transaction) => (
            <li key={transaction.id} className="px-4 py-4">
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
                  {formatDate(transaction.timestamp)}
                </span>
              </div>
              <div className="mt-2">
                <div className="text-sm font-medium text-gray-900">
                  {transaction.amount} credits at ${transaction.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">
                  Total: ${transaction.total.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <div className="flex justify-between">
                  <span>Project:</span>
                  <span className="font-medium text-gray-700">{transaction.projectName}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Buyer:</span>
                  <span className="font-medium text-gray-700">{formatAccount(transaction.buyer)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>Seller:</span>
                  <span className="font-medium text-gray-700">{formatAccount(transaction.seller)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {transactions.length === 0 && (
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Recent transactions will appear here.
            </p>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4 sm:px-6">
        <a
          href="/transactions"
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          View all transactions
          <span aria-hidden="true"> &rarr;</span>
        </a>
      </div>
    </Card>
  );
};