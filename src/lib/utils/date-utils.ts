
/**
 * Formats a date as a readable string (DD.MM.YYYY)
 */
export const formatDate = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return d.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats a date with time (DD.MM.YYYY HH:MM)
 */
export const formatDateTime = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid date';
  
  return d.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Returns a relative time description (e.g., "3 days ago")
 */
export const getRelativeTimeString = (date: Date | string | null): string => {
  if (!date) return 'N/A';
  
  const d = date instanceof Date ? date : new Date(date);
  
  if (isNaN(d.getTime())) return 'Invalid date';

  const rtf = new Intl.RelativeTimeFormat('nb-NO', { numeric: 'auto' });
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return rtf.format(-diffInSeconds, 'second');
  if (diffInSeconds < 3600) return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  if (diffInSeconds < 86400) return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  if (diffInSeconds < 2592000) return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  if (diffInSeconds < 31536000) return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
};
