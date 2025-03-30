export const constants = {
    // Hedera settings
    HCS_TOPIC_MEMO: 'Kabonia Transaction Record',
    HTS_TOKEN_NAME: 'Kabonia Credits',
    HTS_TOKEN_SYMBOL: 'CRX',
    
    // Token and verification settings
    DEFAULT_DECIMALS: 2,
    TOKEN_SUPPLY_TYPE: 'FINITE',
    
    // Authentication
    JWT_EXPIRY: '24h',
    
    // App settings
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    VERIFICATION_THRESHOLD: 0.8,
    
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  
    // Project status options
    PROJECT_STATUS: {
      DRAFT: 'draft',
      PENDING_VERIFICATION: 'pending_verification',
      VERIFIED: 'verified',
      ACTIVE: 'active',
      COMPLETED: 'completed'
    },
  
    // Verification status options
    VERIFICATION_STATUS: {
      PENDING: 'pending',
      IN_PROGRESS: 'in_progress',
      APPROVED: 'approved',
      REJECTED: 'rejected'
    },
  
    // Transaction types
    TRANSACTION_TYPES: {
      MINT: 'mint',
      TRANSFER: 'transfer',
      BUY: 'buy',
      SELL: 'sell'
    }
  };