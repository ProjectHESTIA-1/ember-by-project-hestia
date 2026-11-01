"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env/public";

/**
 * Browser Supabase client (anon key + user session). Subject to Row-Level Security.
 * Prefer Server Components / Server Actions; use this only for auth UI flows and
 * realtime features that need to run in the browser.
 */
export function createSupabaseBrowserClient() {
  const env = publicEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
