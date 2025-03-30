'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setHashConnect, 
  connectWallet, 
  disconnectWallet, 
  setWalletLoading, 
  setWalletError 
} from '@/store/slices/walletSlice';
import { RootState } from '@/store';
import { userService } from '@/services/userService';

const APP_METADATA = {
  name: 'CarbonX',
  description: 'Carbon credit marketplace powered by Hedera',
  icon: 'https://carbonx.example.com/logo.png',
};

export const useHashConnect = () => {
  const dispatch = useDispatch();
  const { isConnected, accountId, hashConnect, pairingData, isLoading, error } = useSelector(
    (state: RootState) => state.wallet
  );
  
  // Initialize HashConnect on component mount
  useEffect(() => {
    const initHashConnect = async () => {
      try {
        dispatch(setWalletLoading(true));
        
        const hashConnectInstance = {
          init: async (metadata: any) => {
            console.log('Initializing HashConnect with metadata:', metadata);
            return {
              topic: 'some-random-topic-id',
              pairingString: 'pairing-string-for-hashpack',
            };
          },
          connect: async (topic: string, pairing: string) => {
            console.log('Connecting to HashConnect with topic:', topic);
            // In a real implementation, this would handle the HashPack connection
            return {
              accountIds: ['0.0.1234567'], 
            };
          },
          disconnect: async (topic: string) => {
            console.log('Disconnecting from HashConnect with topic:', topic);
            // In a real implementation, this would disconnect from HashPack
          },
        };
        
        // Set the HashConnect instance in Redux
        dispatch(setHashConnect(hashConnectInstance));
        
        // Check if user was previously connected
        const savedData = typeof window !== 'undefined' ? localStorage.getItem('hashconnect') : null;
        
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            // Reconnect with saved data
            if (parsedData.accountId && parsedData.pairingData) {
              dispatch(connectWallet({
                accountId: parsedData.accountId,
                pairingData: parsedData.pairingData,
              }));
              
              // Also update user's wallet in the backend
              await userService.connectWallet(parsedData.accountId);
            }
          } catch (parseError) {
            console.error('Error parsing saved HashConnect data:', parseError);
            localStorage.removeItem('hashconnect');
          }
        }
        
        dispatch(setWalletLoading(false));
      } catch (err) {
        console.error('Error initializing HashConnect:', err);
        dispatch(setWalletError('Failed to initialize wallet connection'));
        dispatch(setWalletLoading(false));
      }
    };

    if (!hashConnect) {
      initHashConnect();
    }
  }, [dispatch, hashConnect]);

  // Connect wallet function
  const connectToWallet = async () => {
    if (!hashConnect) {
      dispatch(setWalletError('Wallet connection not initialized'));
      return;
    }
    
    try {
      dispatch(setWalletLoading(true));
      
      // Init HashConnect
      const initData = await hashConnect.init(APP_METADATA);
      const { topic, pairingString } = initData;
      
      const connectionData = await hashConnect.connect(topic, pairingString);
      
      // Save the connection state
      const accountId = connectionData.accountIds[0];
      const pairingData = { topic, pairingString };
      
      // Update Redux state
      dispatch(connectWallet({ accountId, pairingData }));
      
      // Save to localStorage for persistence
      localStorage.setItem('hashconnect', JSON.stringify({ accountId, pairingData }));
      
      // Update user's wallet in the backend
      await userService.connectWallet(accountId);
      
      dispatch(setWalletLoading(false));
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      dispatch(setWalletError('Failed to connect to wallet'));
      dispatch(setWalletLoading(false));
    }
  };

  // Disconnect wallet function
  const disconnectFromWallet = async () => {
    if (!hashConnect || !pairingData) {
      return;
    }
    
    try {
      dispatch(setWalletLoading(true));
      
      // Disconnect from HashConnect
      await hashConnect.disconnect(pairingData.topic);
      
      // Clear the connection state
      dispatch(disconnectWallet());
      
      // Remove from localStorage
      localStorage.removeItem('hashconnect');
      
      dispatch(setWalletLoading(false));
    } catch (err) {
      console.error('Error disconnecting from wallet:', err);
      dispatch(setWalletError('Failed to disconnect from wallet'));
      dispatch(setWalletLoading(false));
    }
  };

  return {
    isConnected,
    accountId,
    connectToWallet,
    disconnectFromWallet,
    isLoading,
    error,
  };
};