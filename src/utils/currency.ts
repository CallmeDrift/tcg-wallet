export function usdToCop(usd: number, rate = 4800) {
  // Placeholder conversion rate; replace with real FX source when available
  return usd * rate;
}

export function formatCurrency(value: number, currency: 'USD' | 'COP') {
  if (currency === 'USD') return `$${value.toFixed(2)} USD`;
  return `$${value.toFixed(0)} COP`;
}
