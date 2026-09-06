import { createBrowserClient } from "@supabase/ssr";

import { requirePublicSupabaseConfig } from "@/lib/env";

/**
 * Supabase client for use in Client Components. Uses the anon key and is bound by
 * Row Level Security. Safe to ship to the browser.
 */
export function createClient() {
  const { url, anonKey } = requirePublicSupabaseConfig();
  return createBrowserClient(url, anonKey);
}
