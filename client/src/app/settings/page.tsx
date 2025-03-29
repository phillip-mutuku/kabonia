'use client';

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card } from '@/components/common/Card';
import AccountInfo from '@/components/wallet/AccountInfo';
import ConnectWallet from '@/components/wallet/ConnectWallet';

const SettingsPage = () => {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { isConnected } = useSelector((state: RootState) => state.wallet);

  return (
    <DashboardLayout>
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      
      <div className="grid grid-cols-1 gap-6">
        {!isConnected && (
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Connect Wallet</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Connect your Hedera wallet to access your carbon credits.
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <ConnectWallet />
            </div>
          </Card>
        )}
        
        {isConnected && (
          <Card className="overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Wallet Information</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                View your connected wallet details and manage your connection.
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <AccountInfo />
            </div>
          </Card>
        )}
      </div>
    </div>
    </DashboardLayout>
  );
};

export default SettingsPage;