import "server-only";
import { z } from "zod";

/**
 * Server-only secrets. Importing this module from a Client Component fails the build
 * (via the `server-only` package), which is the first line of defense against leaking
 * the service-role key.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

/** Parsed server secrets, exposed under neutral names so raw env names stay in this file. */
export type ServerEnv = {
  supabaseServiceRoleKey: string;
};

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const missing = result.error.issues.map((i) => i.path.join(".")).join(", ");
    // Never include the values in the message.
    throw new Error(`Invalid server environment configuration: ${missing}`);
  }
  return { supabaseServiceRoleKey: result.data.SUPABASE_SERVICE_ROLE_KEY };
}

let cached: ServerEnv | undefined;

export function serverEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}
