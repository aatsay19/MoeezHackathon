import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { requirePublicSupabaseConfig } from "@/lib/env";

/**
 * Privileged Supabase client. Uses the service-role key and BYPASSES Row Level
 * Security. Use only in trusted server code (seeding, admin verification,
 * authorised contact reveal) and always re-check authorisation in the caller.
 *
 * The `server-only` import makes the build fail if this module is ever pulled
 * into a client bundle. The service-role key is read here (not in lib/env.ts) so
 * no secret reference exists in a module that client code can import.
 */
function requireServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. This key is server-only and must never be exposed to the browser.",
    );
  }
  return key;
}

export function createAdminClient() {
  const { url } = requirePublicSupabaseConfig();
  const serviceRoleKey = requireServiceRoleKey();

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
