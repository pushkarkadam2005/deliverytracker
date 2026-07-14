export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(value);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

export const formatWeight = (weight) => {
  if (weight === null || weight === undefined) return '0 kg';
  return `${Number(weight).toFixed(2)} kg`;
};
