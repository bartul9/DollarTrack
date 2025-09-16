import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { PublicUser } from "@shared/schema";

export const currentUserQueryKey = ["/api/auth/me"] as const;

export function useCurrentUser() {
  return useQuery<PublicUser | null>({
    queryKey: currentUserQueryKey,
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
}
