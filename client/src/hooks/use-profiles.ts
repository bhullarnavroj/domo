import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateProfileRequest, type UpdateProfileRequest } from "@shared/routes";

export function useProfile() {
  return useQuery({
    queryKey: [api.profiles.me.path],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profiles.me.responses[200].parse(await res.json());
    },
    retry: false,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateProfileRequest) => {
      const res = await fetch(api.profiles.create.path, {
        method: api.profiles.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create profile");
      return api.profiles.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateProfileRequest) => {
      const res = await fetch(api.profiles.update.path, {
        method: api.profiles.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profiles.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.profiles.me.path] });
    },
  });
}
