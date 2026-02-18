import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useInvoices() {
  return useQuery({
    queryKey: [api.invoices.list.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch invoices");
      return res.json();
    },
  });
}

export function useEarnings() {
  return useQuery({
    queryKey: [api.invoices.earnings.path],
    queryFn: async () => {
      const res = await fetch(api.invoices.earnings.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch earnings");
      return res.json();
    },
  });
}

export function useInvoiceByRequest(requestId: number) {
  return useQuery({
    queryKey: ['/api/invoices/by-request', requestId],
    queryFn: async () => {
      const res = await fetch(`/api/invoices/by-request/${requestId}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!requestId,
  });
}

export function usePayInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const url = buildUrl(api.invoices.pay.path, { id: invoiceId });
      const res = await fetch(url, {
        method: api.invoices.pay.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to initiate payment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.invoices.earnings.path] });
    },
  });
}
