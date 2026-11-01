import "server-only";
import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";

/**
 * Service-role client. BYPASSES ROW-LEVEL SECURITY.
 *
 * Rules:
 *  - Only import from server-side modules that are listed in docs/AUTHORIZATION.md
 *    under "Service-role code paths" (for example, payment webhooks, admin jobs).
 *  - Never pass it into shared helpers that also accept the user-scoped client.
 *  - Every mutation made with it must write an audit_logs row.
 *
 * Changes to this file are a protected-area change (see CODEOWNERS).
 */
export function createSupabaseAdminClient() {
  const env = publicEnv();
  const secrets = serverEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, secrets.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
