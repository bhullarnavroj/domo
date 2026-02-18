export const COMMISSION_TIERS = [
  { maxAmount: 50000, rate: 0.15, label: "Under $500" },
  { maxAmount: 200000, rate: 0.12, label: "$500 - $2,000" },
  { maxAmount: 1000000, rate: 0.10, label: "$2,000 - $10,000" },
  { maxAmount: Infinity, rate: 0.08, label: "Over $10,000" },
] as const;

export function getCommissionRate(amountCents: number): number {
  if (amountCents < 50000) return 0.15;
  if (amountCents < 200000) return 0.12;
  if (amountCents < 1000000) return 0.10;
  return 0.08;
}

export function calculateCommission(amountCents: number): number {
  const rate = getCommissionRate(amountCents);
  return Math.round(amountCents * rate);
}

export function getCommissionPercentage(amountCents: number): string {
  const rate = getCommissionRate(amountCents);
  return `${Math.round(rate * 100)}%`;
}

export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}
