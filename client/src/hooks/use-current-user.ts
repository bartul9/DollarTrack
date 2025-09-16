import { useQuery } from "@tanstack/react-query";
import type { PublicUser } from "@shared/schema";

export const currentUserQueryKey = ["/api/auth/me"] as const;

export function useCurrentUser() {
  return useQuery<PublicUser | null>({
    queryKey: currentUserQueryKey,
    queryFn: () => {},
  });
}
