/**
 * Centralised environment access.
 *
 * `NEXT_PUBLIC_*` vars must be referenced with static property access so Next.js
 * can inline them into client bundles. The `require*` helpers defer the "missing
 * variable" error to request time, so `next build` still succeeds without a
 * populated `.env.local` (useful in CI before secrets are configured).
 */

const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
} as const;

export function requirePublicSupabaseConfig(): {
  url: string;
  anonKey: string;
} {
  const { supabaseUrl, supabaseAnonKey } = publicConfig;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill in your Supabase project values.",
    );
  }
  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}

export const siteUrl = publicConfig.siteUrl;

/** True when the public Supabase config is present. Safe on client and server. */
export function isSupabaseConfigured(): boolean {
  return Boolean(publicConfig.supabaseUrl && publicConfig.supabaseAnonKey);
}
