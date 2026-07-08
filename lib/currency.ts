export function convertPrice(
  price: number,
  currency: string = "USD",
  usdToTryRate: number = 0
): number {
  if (currency.toUpperCase() === "USD") return price;
  if (usdToTryRate > 0) return price * usdToTryRate;
  return price;
}

export function formatPrice(
  price: number,
  currency: string = "USD",
  usdToTryRate: number = 0
): string {
  const convertedPrice = convertPrice(price, currency, usdToTryRate);
  const symbol = getCurrencySymbol(currency);
  return `${convertedPrice.toFixed(2)} ${symbol}`;
}

export function getCurrencySymbol(currency: string = "USD"): string {
  const symbols: Record<string, string> = {
    USD: "$",
    TRY: "₺",
    SYP: "ل.س",
    SAR: "ر.س",
    AED: "د.إ",
    EUR: "€",
    GBP: "£",
  };

  return symbols[currency.toUpperCase()] || currency.toUpperCase();
}
