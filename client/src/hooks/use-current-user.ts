import { useQuery } from "@tanstack/react-query";
import type { User as SupabaseUser } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { PublicUser } from "@shared/schema";

export const currentUserQueryKey = ["/api/auth/me"] as const;

export function supabaseUserToPublicUser(user: SupabaseUser): PublicUser {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const nameCandidates = [
    metadata.name,
    metadata.full_name,
    metadata.display_name,
  ];

  const name =
    nameCandidates.find(
      (value): value is string =>
        typeof value === "string" && value.trim().length > 0
    ) ?? (user.email ? user.email.split("@")[0] : "User");

  return {
    id: user.id,
    email: user.email ?? "",
    name,
  };
}

async function fetchCurrentUser(): Promise<PublicUser | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    // Supabase returns AuthSessionMissingError when no session is available.
    if (
      error.name === "AuthSessionMissingError" ||
      (typeof error.message === "string" &&
        error.message.toLowerCase().includes("session"))
    ) {
      return null;
    }

    throw error;
  }

  const user = data.user;
  if (!user) {
    return null;
  }

  return supabaseUserToPublicUser(user);
}

export function useCurrentUser() {
  return useQuery<PublicUser | null>({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
