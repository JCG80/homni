
/**
 * Format a date string to a localized date format
 */
export const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Ukjent dato';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nb-NO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Format a number as Norwegian currency (NOK)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('nb-NO', {
    style: 'currency',
    currency: 'NOK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get a human-readable property type label
 */
export const getPropertyTypeLabel = (type: string): string => {
  switch (type) {
    case 'house':
      return 'Bolig';
    case 'cabin':
      return 'Hytte';
    case 'rental':
      return 'Utleiebolig';
    case 'foreign':
      return 'Fritidsbolig i utlandet';
    default:
      return type;
  }
};

/**
 * Calculate the total expenses for a property over a period
 */
export const calculateTotalExpenses = (expenses: Array<{ amount: number }>): number => {
  return expenses.reduce((total, expense) => total + expense.amount, 0);
};
