import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useMessages(requestId: number) {
  return useQuery({
    queryKey: [api.messages.listByRequest.path, requestId],
    queryFn: async () => {
      const url = buildUrl(api.messages.listByRequest.path, { requestId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 403) return [];
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    enabled: !!requestId,
    refetchInterval: 8000,
  });
}

export function useCreateMessage(requestId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: string) => {
      const url = buildUrl(api.messages.create.path, { requestId });
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.messages.listByRequest.path, requestId] });
    },
  });
}
