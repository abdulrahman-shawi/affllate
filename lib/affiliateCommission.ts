type AffiliateCommissionInput = {
  affiliatePrice: number | null | undefined;
  affiliateCommissionRate: number | null | undefined;
  fallbackCommissionRate: number;
  itemPrice: number;
  quantity: number;
};

export function calculateAffiliateCommission({
  affiliatePrice,
  affiliateCommissionRate,
  fallbackCommissionRate,
  itemPrice,
  quantity,
}: AffiliateCommissionInput): number {
  if ((affiliatePrice ?? 0) > 0) {
    return roundCommission(affiliatePrice! * quantity);
  }

  const commissionRate = affiliateCommissionRate ?? fallbackCommissionRate;
  const commissionAmount = (itemPrice * quantity * commissionRate) / 100;

  return roundCommission(commissionAmount);
}

function roundCommission(amount: number): number {
  return Math.round(amount * 100) / 100;
}