import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { requirePublicSupabaseConfig } from "@/lib/env";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers.
 * Uses the anon key plus the caller's session cookie, so every query runs as the
 * signed-in user and is enforced by Row Level Security.
 *
 * Always `await` this — `cookies()` is async in Next.js 16.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = requirePublicSupabaseConfig();

  return createServerClient(url, anonKey, {
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
          // `setAll` was called from a Server Component. Safe to ignore when the
          // session is refreshed by the proxy (see proxy.ts).
        }
      },
    },
  });
}
