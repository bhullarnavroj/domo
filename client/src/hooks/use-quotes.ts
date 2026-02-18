import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateQuoteRequest, type QuoteResponse } from "@shared/routes";

// List quotes for a specific request
export function useQuotes(requestId: number) {
  return useQuery({
    queryKey: [api.quotes.listByRequest.path, requestId],
    queryFn: async () => {
      const url = buildUrl(api.quotes.listByRequest.path, { requestId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch quotes");
      return api.quotes.listByRequest.responses[200].parse(await res.json());
    },
    enabled: !!requestId,
  });
}

// Create a quote
export function useCreateQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ serviceRequestId, ...data }: CreateQuoteRequest) => {
      const url = buildUrl(api.quotes.create.path, { requestId: serviceRequestId });
      const res = await fetch(url, {
        method: api.quotes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit quote");
      return api.quotes.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.quotes.listByRequest.path, variables.serviceRequestId] });
      queryClient.invalidateQueries({ queryKey: [api.serviceRequests.list.path] });
    },
  });
}

// Accept a quote
export function useAcceptQuote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quoteId: number) => {
      const url = buildUrl(api.quotes.accept.path, { id: quoteId });
      const res = await fetch(url, {
        method: api.quotes.accept.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to accept quote");
      return api.quotes.accept.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.quotes.listByRequest.path, data.serviceRequestId] });
      queryClient.invalidateQueries({ queryKey: [api.serviceRequests.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.serviceRequests.get.path, data.serviceRequestId] });
    },
  });
}
