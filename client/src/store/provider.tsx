'use client';

import { Provider } from 'react-redux';
import { store } from './index';
import { useEffect } from 'react';
import { checkAuthState } from '@/store/slices/userSlice';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check authentication state when the app loads
    store.dispatch(checkAuthState());
  }, []);
  
  return <Provider store={store}>{children}</Provider>;
}