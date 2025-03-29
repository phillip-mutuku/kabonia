import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  isConnected: boolean;
  accountId: string | null;
  hashConnect: any; // HashConnect instance
  pairingData: any; // HashConnect pairing data
  isLoading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  accountId: null,
  hashConnect: null,
  pairingData: null,
  isLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setHashConnect: (state, action: PayloadAction<any>) => {
      state.hashConnect = action.payload;
    },
    connectWallet: (state, action: PayloadAction<{ accountId: string; pairingData: any }>) => {
      state.isConnected = true;
      state.accountId = action.payload.accountId;
      state.pairingData = action.payload.pairingData;
    },
    disconnectWallet: (state) => {
      state.isConnected = false;
      state.accountId = null;
      state.pairingData = null;
    },
    setWalletLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setWalletError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearWalletError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setHashConnect,
  connectWallet,
  disconnectWallet,
  setWalletLoading,
  setWalletError,
  clearWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;