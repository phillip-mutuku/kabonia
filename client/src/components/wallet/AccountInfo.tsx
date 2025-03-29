'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useHashConnect } from '@/hooks/useHashConnect';
import { formatCurrency } from '@/utils/formatters';

interface AccountInfoProps {
  className?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ className = '' }) => {
  const { accountId, disconnectFromWallet, isConnected } = useHashConnect();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [accountBalance, setAccountBalance] = useState<{
    hbar: number;
    tokens: { id: string; symbol: string; balance: number }[];
  }>({
    hbar: 0,
    tokens: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAccountBalance = async () => {
      if (!accountId) return;
      
      setIsLoading(true);
      try {
        setTimeout(() => {
          setAccountBalance({
            hbar: 100.25,
            tokens: [
              { id: '0.0.12345', symbol: 'CRX', balance: 50 },
              { id: '0.0.12346', symbol: 'HBAR', balance: 150 },
            ],
          });
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching account balance:', error);
        setIsLoading(false);
      }
    };

    fetchAccountBalance();
  }, [accountId]);

  if (!accountId) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">No Wallet Connected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connect your wallet to view your account information.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-primary-50">
        <div className="flex justify-between items-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Account Information</h3>
          <Button variant="secondary" size="sm" onClick={disconnectFromWallet}>
            Disconnect
          </Button>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Your Hedera account details and balances.
        </p>
      </div>

      {isLoading ? (
        <div className="px-4 py-12 sm:px-6 flex justify-center">
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
      ) : (
        <div className="px-4 py-5 sm:p-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Account ID</dt>
              <dd className="mt-1 text-sm text-gray-900 break-all">{accountId}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Network</dt>
              <dd className="mt-1 text-sm text-gray-900 capitalize">
                testnet
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">User Name</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentUser?.name || 'Guest'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentUser?.email || 'Not Available'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">HBAR Balance</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">
                {accountBalance.hbar.toFixed(2)} ℏ
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({formatCurrency(accountBalance.hbar * 0.08, 'USD')})
                </span>
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-500">Token Balances</h4>
            {accountBalance.tokens.length > 0 ? (
              <ul className="mt-2 divide-y divide-gray-200">
                {accountBalance.tokens.map((token) => (
                  <li key={token.id} className="py-3 flex justify-between">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{token.symbol}</span>
                      <p className="text-xs text-gray-500">{token.id}</p>
                    </div>
                    <span className="text-sm text-gray-900">{token.balance.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No tokens found in this account.</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <Button variant="outline" fullWidth>
              View in Explorer
            </Button>
            <Button variant="primary" fullWidth>
              Transfer Funds
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AccountInfo;