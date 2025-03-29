import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './slices/projectSlice';
import tokenReducer from './slices/tokenSlice';
import marketReducer from './slices/marketSlice';
import userReducer from './slices/userSlice';
import walletReducer from './slices/walletSlice';

export const store = configureStore({
  reducer: {
    project: projectReducer,
    token: tokenReducer,
    market: marketReducer,
    user: userReducer,
    wallet: walletReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['wallet/setHashConnect'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['wallet.hashConnect'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export actions for convenience
export { 
  getProjects 
} from './slices/projectSlice';
export { 
  getTokens 
} from './slices/tokenSlice';
export { 
  getMarketSummary 
} from './slices/marketSlice';
export { 
  getUserTokens 
} from './slices/tokenSlice';

export { 
  getTransactionHistory 
} from './slices/marketSlice';
export { getUserProjects as fetchUserProjects } from './slices/projectSlice';
