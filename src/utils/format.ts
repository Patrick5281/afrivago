const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  XAF: 'FCFA',
  XOF: 'FCFA',
};

export const formatPrice = (amount: number, currency: string = 'EUR'): string => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formattedAmount = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  return `${formattedAmount} ${symbol}`;
}; 