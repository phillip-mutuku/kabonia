/**
 * Format currency values
 */
export const formatCurrency = (value: number, currency = 'USD', digits = 2): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  };
  
  /**
   * Format date to local string
   */
  export const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {}): string => {
    const date = new Date(dateString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(date);
  };
  
  /**
   * Format number with thousands separators
   */
  export const formatNumber = (value: number, digits = 0): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  };
  
  /**
   * Format relative time (e.g., "2 days ago")
   */
  export const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) {
          return 'Just now';
        }
        return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
      }
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
    } else {
      const diffYears = Math.floor(diffDays / 365);
      return `${diffYears} year${diffYears === 1 ? '' : 's'} ago`;
    }
  };
  
  /**
   * Format file size
   */
  export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  /**
   * Format Hedera account ID (e.g., "0.0.1234" to "0.0.1234" or abbreviated "0.0.12...34")
   */
  export const formatAccountId = (accountId?: string, abbreviated = false): string => {
    if (!accountId) return '—';
    
    if (!abbreviated || accountId.length <= 12) {
      return accountId;
    }
    
    const parts = accountId.split('.');
    if (parts.length !== 3) return accountId;
    
    const lastPart = parts[2];
    if (lastPart.length <= 8) return accountId;
    
    return `${parts[0]}.${parts[1]}.${lastPart.substring(0, 4)}...${lastPart.substring(lastPart.length - 4)}`;
  };
  
  /**
   * Format carbon offset value
   */
  export const formatCarbonOffset = (tons: number): string => {
    if (tons < 0.01) {
      return `${(tons * 1000).toFixed(0)} kg CO₂`;
    } else if (tons < 1) {
      return `${tons.toFixed(2)} tons CO₂`;
    } else if (tons < 10) {
      return `${tons.toFixed(1)} tons CO₂`;
    } else {
      return `${Math.round(tons)} tons CO₂`;
    }
  };
  
  /**
   * Format percentage
   */
  export const formatPercentage = (value: number, digits = 1): string => {
    return `${value.toFixed(digits)}%`;
  };
  
  /**
   * Format project area
   */
  export const formatArea = (hectares: number): string => {
    if (hectares < 1) {
      return `${Math.round(hectares * 10000)} m²`;
    } else if (hectares < 10) {
      return `${hectares.toFixed(2)} hectares`;
    } else {
      return `${Math.round(hectares)} hectares`;
    }
  };
  
  /**
   * Truncate text with ellipsis
   */
  export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  /**
   * Convert kebab-case or snake_case to Title Case
   */
  export const toTitleCase = (text: string): string => {
    return text
      .replace(/-/g, ' ')
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
  };