/**
 * Person color mappings for consistent styling across components
 */
export const personColors: { [key: string]: string } = {
  'Aaron Woods': 'bg-blue-100 text-blue-800',
  'Yvonne Bledsoe': 'bg-orange-100 text-orange-800',
  Brandon: 'bg-green-100 text-green-800',
  'IRS/Other': 'bg-gray-100 text-gray-800',
};

/**
 * Person color mappings with dark mode support for mobile components
 */
export const personColorsWithDarkMode: { [key: string]: string } = {
  'Aaron Woods':
    'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'Yvonne Bledsoe':
    'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  Brandon: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'IRS/Other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

/**
 * Person color mappings for summary cards with dark mode support
 */
export const personSummaryColors: { [key: string]: string } = {
  'Aaron Woods':
    'border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-900/20',
  'Yvonne Bledsoe':
    'border-orange-200 bg-orange-50 dark:border-orange-700 dark:bg-orange-900/20',
  Brandon:
    'border-green-200 bg-green-50 dark:border-green-700 dark:bg-green-900/20',
  'IRS/Other':
    'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20',
};

/**
 * Person badge color mappings for transaction summaries
 */
export const personBadgeColors: { [key: string]: string } = {
  'Aaron Woods': 'bg-blue-500 text-white border-blue-500',
  'Yvonne Bledsoe': 'bg-orange-500 text-white border-orange-500',
  Brandon: 'bg-green-500 text-white border-green-500',
  'IRS/Other': 'bg-gray-500 text-white border-gray-500',
};

/**
 * List of all persons for dropdowns and form inputs
 */
export const persons = [
  'Aaron Woods',
  'Yvonne Bledsoe',
  'Brandon',
  'IRS/Other',
];

/**
 * Format currency values for display
 */
export const formatCurrency = (value: number): string => {
  if (value === 0) return '';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Format date strings for display
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
  });
};

/**
 * Calculate net amount and determine if it's positive
 */
export const calculateNetAmount = (transaction: {
  inflow: number;
  outflow: number;
}) => {
  const netAmount = transaction.inflow - transaction.outflow;
  const isPositive = netAmount > 0;
  return { netAmount, isPositive };
};
