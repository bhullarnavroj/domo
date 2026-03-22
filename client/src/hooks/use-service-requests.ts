import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateServiceRequestRequest, type UpdateServiceRequestRequest } from "@shared/routes";

// List requests (filterable + paginated)
export function useServiceRequests(filters?: {
  category?: string;
  status?: "open" | "in_progress" | "completed" | "cancelled";
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const queryKey = [api.serviceRequests.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.serviceRequests.list.path, window.location.origin);
      if (filters?.category) url.searchParams.set("category", filters.category);
      if (filters?.status) url.searchParams.set("status", filters.status);
      if (filters?.search) url.searchParams.set("search", filters.search);
      if (filters?.limit) url.searchParams.set("limit", String(filters.limit));
      if (filters?.offset) url.searchParams.set("offset", String(filters.offset));

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch service requests");
      return api.serviceRequests.list.responses[200].parse(await res.json());
    },
  });
}

// Get single request
export function useServiceRequest(id: number) {
  return useQuery({
    queryKey: [api.serviceRequests.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.serviceRequests.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch service request");
      return api.serviceRequests.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Create request
export function useCreateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateServiceRequestRequest) => {
      const res = await fetch(api.serviceRequests.create.path, {
        method: api.serviceRequests.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create service request");
      return api.serviceRequests.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.serviceRequests.list.path] });
    },
  });
}

// Update request (status, details)
export function useUpdateServiceRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateServiceRequestRequest & { id: number }) => {
      const url = buildUrl(api.serviceRequests.update.path, { id });
      const res = await fetch(url, {
        method: api.serviceRequests.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update service request");
      return api.serviceRequests.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.serviceRequests.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.serviceRequests.get.path, data.id] });
    },
  });
}
