import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env/public";

/**
 * Per-request Supabase client that acts as the signed-in user.
 *
 * Uses the anon key plus the user's session cookie, so every query is subject to
 * Row-Level Security. This is the default client for all application code.
 *
 * Must be called inside a request scope (Server Component, Server Action, Route Handler).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const env = publicEnv();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, where cookies are read-only.
          // Session refresh is handled by the proxy/middleware layer (Phase 1).
        }
      },
    },
  });
}
