/**
 * Utility functions for formatting various data types
 */

/**
 * Format a number as Norwegian currency (NOK)
 */
export const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options
  }).format(amount);
};

/**
 * Format a large number with Norwegian locale (e.g., 1 234 567)
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('nb-NO').format(number);
};

/**
 * Format a percentage with Norwegian locale
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format a date to Norwegian locale
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj);
};

/**
 * Format a date and time to Norwegian locale
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('nb-NO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);
};

/**
 * Format a phone number to Norwegian format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Norwegian phone number formatting
  if (digits.length === 8) {
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  }
  
  // International format starting with country code
  if (digits.length === 10 && digits.startsWith('47')) {
    const nationalNumber = digits.substring(2);
    return `+47 ${nationalNumber.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')}`;
  }
  
  // Return original if doesn't match expected patterns
  return phone;
};

/**
 * Truncate text to specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Format address for display
 */
export const formatAddress = (address: {
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}): string => {
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.postalCode && address.city) {
    parts.push(`${address.postalCode} ${address.city}`);
  } else {
    if (address.postalCode) parts.push(address.postalCode);
    if (address.city) parts.push(address.city);
  }
  if (address.country && address.country !== 'Norge') {
    parts.push(address.country);
  }
  
  return parts.join(', ');
};