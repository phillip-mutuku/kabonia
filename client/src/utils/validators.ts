/**
 * Email validation
 */
export const isValidEmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };
  
  /**
   * Password validation - at least 6 characters, containing letters and numbers
   */
  export const isValidPassword = (password: string): boolean => {
    return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
  };
  
  /**
   * Hedera account ID validation (e.g., 0.0.1234)
   */
  export const isValidHederaAccountId = (accountId: string): boolean => {
    const regex = /^[0-9]+\.[0-9]+\.[0-9]+$/;
    return regex.test(accountId);
  };
  
  /**
   * URL validation
   */
  export const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };
  
  /**
   * File size validation
   */
  export const isValidFileSize = (file: File, maxSizeInBytes: number): boolean => {
    return file.size <= maxSizeInBytes;
  };
  
  /**
   * File type validation
   */
  export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  };
  
  /**
   * Required field validation
   */
  export const isRequired = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim() !== '';
    if (Array.isArray(value)) return value.length > 0;
    return true;
  };
  
  /**
   * Number range validation
   */
  export const isInRange = (value: number, min: number, max: number): boolean => {
    return value >= min && value <= max;
  };
  
  /**
   * Coordinates validation
   */
  export const isValidCoordinates = (lat: number, lng: number): boolean => {
    return isInRange(lat, -90, 90) && isInRange(lng, -180, 180);
  };
  
  /**
   * Date validation - checks if date is valid and not in the past if specified
   */
  export const isValidDate = (dateString: string, allowPast = true): boolean => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    if (!allowPast) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return date >= today;
    }
    return true;
  };
  
  /**
   * Date range validation - checks if end date is after start date
   */
  export const isValidDateRange = (startDateString: string, endDateString: string): boolean => {
    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false;
    
    return endDate >= startDate;
  };
  
  /**
   * Form validation helper - validates all fields and returns errors
   */
  export const validateForm = (
    fields: Record<string, any>,
    validations: Record<string, (value: any) => boolean>,
    errorMessages: Record<string, string>
  ): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    Object.keys(validations).forEach(field => {
      if (field in fields && !validations[field](fields[field])) {
        errors[field] = errorMessages[field] || `Invalid ${field}`;
      }
    });
    
    return errors;
  };
  
  /**
   * Check if object is empty
   */
  export const isEmptyObject = (obj: Record<string, any>): boolean => {
    return Object.keys(obj).length === 0;
  };
  
  /**
   * Validate number input
   */
  export const isNumber = (value: any): boolean => {
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'string') return !isNaN(Number(value));
    return false;
  };
  
  /**
   * Validate positive number
   */
  export const isPositiveNumber = (value: any): boolean => {
    return isNumber(value) && Number(value) > 0;
  };
  
  /**
   * Validate non-negative number (zero or positive)
   */
  export const isNonNegativeNumber = (value: any): boolean => {
    return isNumber(value) && Number(value) >= 0;
  };