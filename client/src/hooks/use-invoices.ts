import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

// List invoices for current user
export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return api.invoices.list.responses[200].parse(await res.json());
    },
  });
}

// Pay commission for an invoice
export function usePayCommission() {
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const url = buildUrl(api.invoices.payCommission.path, { id: invoiceId });
      const res = await fetch(url, {
        method: api.invoices.payCommission.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to initiate payment");
      return api.invoices.payCommission.responses[200].parse(await res.json());
    },
  });
}
