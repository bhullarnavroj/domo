export interface TaxRates {
  gst: number;
  pst: number;
  hst: number;
  label: string;
}

export const PROVINCES: Record<string, TaxRates> = {
  AB: { gst: 0.05, pst: 0, hst: 0, label: "Alberta" },
  BC: { gst: 0.05, pst: 0.07, hst: 0, label: "British Columbia" },
  MB: { gst: 0.05, pst: 0.07, hst: 0, label: "Manitoba" },
  NB: { gst: 0, pst: 0, hst: 0.15, label: "New Brunswick" },
  NL: { gst: 0, pst: 0, hst: 0.15, label: "Newfoundland & Labrador" },
  NS: { gst: 0, pst: 0, hst: 0.15, label: "Nova Scotia" },
  NT: { gst: 0.05, pst: 0, hst: 0, label: "Northwest Territories" },
  NU: { gst: 0.05, pst: 0, hst: 0, label: "Nunavut" },
  ON: { gst: 0, pst: 0, hst: 0.13, label: "Ontario" },
  PE: { gst: 0, pst: 0, hst: 0.15, label: "Prince Edward Island" },
  QC: { gst: 0.05, pst: 0.09975, hst: 0, label: "Quebec" },
  SK: { gst: 0.05, pst: 0.06, hst: 0, label: "Saskatchewan" },
  YT: { gst: 0.05, pst: 0, hst: 0, label: "Yukon" },
};

export const PROVINCE_LIST = Object.entries(PROVINCES).map(([code, rates]) => ({
  code,
  ...rates,
}));

export function calculateTax(baseAmountCents: number, provinceCode: string) {
  const rates = PROVINCES[provinceCode];
  if (!rates) {
    return { gstCents: 0, pstCents: 0, totalTaxCents: 0, isHst: false };
  }

  if (rates.hst > 0) {
    const hstCents = Math.round(baseAmountCents * rates.hst);
    return { gstCents: hstCents, pstCents: 0, totalTaxCents: hstCents, isHst: true };
  }

  const gstCents = Math.round(baseAmountCents * rates.gst);
  const pstCents = Math.round(baseAmountCents * rates.pst);
  return { gstCents, pstCents, totalTaxCents: gstCents + pstCents, isHst: false };
}

export function getTaxLabel(provinceCode: string) {
  const rates = PROVINCES[provinceCode];
  if (!rates) return "Tax";
  if (rates.hst > 0) return `HST (${(rates.hst * 100).toFixed(0)}%)`;
  
  const parts: string[] = [];
  if (rates.gst > 0) parts.push(`GST ${(rates.gst * 100).toFixed(0)}%`);
  if (rates.pst > 0) {
    const pstLabel = provinceCode === "QC" ? "QST" : "PST";
    parts.push(`${pstLabel} ${(rates.pst * 100).toFixed(rates.pst === 0.09975 ? 3 : 0)}%`);
  }
  return parts.join(" + ") || "No Tax";
}

export function formatTaxBreakdown(gstCents: number, pstCents: number, provinceCode: string) {
  const rates = PROVINCES[provinceCode];
  if (!rates) return [];

  const lines: { label: string; amount: number }[] = [];

  if (rates.hst > 0) {
    lines.push({ label: `HST (${(rates.hst * 100).toFixed(0)}%)`, amount: gstCents });
  } else {
    if (rates.gst > 0) {
      lines.push({ label: `GST (${(rates.gst * 100).toFixed(0)}%)`, amount: gstCents });
    }
    if (rates.pst > 0) {
      const pstLabel = provinceCode === "QC" ? "QST" : "PST";
      lines.push({ label: `${pstLabel} (${(rates.pst * 100).toFixed(rates.pst === 0.09975 ? 3 : 0)}%)`, amount: pstCents });
    }
  }

  return lines;
}
