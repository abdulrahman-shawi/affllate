type AffiliateCommissionInput = {
  affiliatePrice: number | null | undefined;
  affiliateCommissionRate: number | null | undefined;
  linkCommissionRate: number | null | undefined;
  itemPrice: number;
  quantity: number;
};

export function calculateAffiliateCommission({
  affiliatePrice,
  affiliateCommissionRate,
  linkCommissionRate,
  itemPrice,
  quantity,
}: AffiliateCommissionInput): number {
  if ((linkCommissionRate ?? 0) > 0) {
    return roundCommission((itemPrice * quantity * linkCommissionRate!) / 100);
  }

  if ((affiliateCommissionRate ?? 0) > 0) {
    return roundCommission((itemPrice * quantity * affiliateCommissionRate!) / 100);
  }

  if ((affiliatePrice ?? 0) > 0) {
    return roundCommission(affiliatePrice! * quantity);
  }

  return 0;
}

function roundCommission(amount: number): number {
  return Math.round(amount * 100) / 100;
}