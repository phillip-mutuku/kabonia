'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useHashConnect } from '@/hooks/useHashConnect';
import { isValidHederaAccountId } from '@/utils/validators';
import { connectWallet as connectWalletAction } from '@/store/slices/walletSlice';

interface ConnectWalletProps {
  className?: string;
  redirectAfterConnect?: string;
}

const ConnectWallet: React.FC<ConnectWalletProps> = ({ 
  className = '', 
  redirectAfterConnect = '/dashboard' 
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { 
    connectToWallet, 
    disconnectFromWallet, 
    accountId, 
    isConnected,
    error: connectionError 
  } = useHashConnect();
  
  const [manualAccountId, setManualAccountId] = useState('');
  const [manualAccountError, setManualAccountError] = useState('');
  const [activeTab, setActiveTab] = useState<'extension' | 'manual'>('extension');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already connected
  useEffect(() => {
    if (isConnected && accountId) {
      if (redirectAfterConnect) {
        router.push(redirectAfterConnect);
      }
    }
  }, [isConnected, accountId, router, redirectAfterConnect]);

  const handleConnectWallet = async () => {
    setIsLoading(true);
    try {
      await connectToWallet();
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualConnect = async () => {
    if (!manualAccountId) {
      setManualAccountError('Please enter an account ID');
      return;
    }

    if (!isValidHederaAccountId(manualAccountId)) {
      setManualAccountError('Invalid Hedera account ID format (e.g., 0.0.1234)');
      return;
    }

    setIsLoading(true);
    try {
      // Update wallet state with the manual wallet ID
      dispatch(connectWalletAction({
        accountId: manualAccountId,
        pairingData: null,
      }));
      
      // Redirect after manual connection
      if (redirectAfterConnect) {
        router.push(redirectAfterConnect);
      }
    } catch (error) {
      console.error('Error connecting wallet manually:', error);
      setManualAccountError('Failed to connect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Connect Your Wallet</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Connect your Hedera wallet to access carbon credit features.
        </p>
      </div>
      
      <div className="px-4 py-5 sm:p-6">
        {isConnected ? (
          <div className="text-center">
            <div className="mt-2 flex items-center justify-center">
              <svg
                className="h-10 w-10 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Wallet Connected</h3>
            <p className="mt-1 text-sm text-gray-500">
              Your wallet ({accountId}) is successfully connected.
            </p>
            <div className="mt-6 flex justify-center space-x-3">
              <Button variant="secondary" onClick={disconnectFromWallet}>
                Disconnect
              </Button>
              <Button 
                variant="primary" 
                onClick={() => router.push(redirectAfterConnect)}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('extension')}
                  className={`${
                    activeTab === 'extension'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  HashPack Wallet
                </button>
                <button
                  onClick={() => setActiveTab('manual')}
                  className={`${
                    activeTab === 'manual'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                >
                  Manual Connection
                </button>
              </nav>
            </div>

            <div className="mt-6">
              {activeTab === 'extension' ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2h2m2-4h.01"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">HashPack Wallet</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Connect using the HashPack browser extension for a secure experience
                    </p>
                  </div>

                  {connectionError && (
                    <div className="rounded-md bg-red-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-red-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">
                            Connection Error
                          </h3>
                          <div className="mt-2 text-sm text-red-700">
                            <p>{connectionError || 'Failed to connect to HashPack. Please ensure the extension is installed and try again.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <Button
                      variant="primary"
                      onClick={handleConnectWallet}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Connecting...' : 'Connect HashPack Wallet'}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    Don't have HashPack installed?{' '}
                    <a
                      href="https://www.hashpack.app/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-500"
                    >
                      Download HashPack
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="flex justify-center">
                      <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </div>
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Manual Connection</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Enter your Hedera account ID manually
                    </p>
                  </div>

                  <div>
                    <label htmlFor="accountId" className="block text-sm font-medium text-gray-700">
                      Hedera Account ID
                    </label>
                    <div className="mt-1">
                      <Input
                        id="accountId"
                        name="accountId"
                        type="text"
                        placeholder="0.0.1234"
                        value={manualAccountId}
                        onChange={(e) => {
                          setManualAccountId(e.target.value);
                          setManualAccountError('');
                        }}
                        className="w-full"
                      />
                    </div>
                    {manualAccountError && (
                      <p className="mt-2 text-sm text-red-600">{manualAccountError}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Enter your Hedera account ID in the format 0.0.XXXX
                    </p>
                  </div>

                  <div>
                    <Button
                      variant="primary"
                      onClick={handleManualConnect}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? 'Connecting...' : 'Connect Account'}
                    </Button>
                  </div>

                  <div className="text-xs text-center text-gray-500 mt-4">
                    <p>
                      Note: Manual connection provides limited functionality.
                      <br />
                      We recommend using HashPack for the best experience.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConnectWallet;