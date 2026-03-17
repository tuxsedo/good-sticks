import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Supabase client — null if env vars aren't configured.
 * All auth/sync code should guard: `if (!supabase) return`.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export type SupabaseProfile = {
  id: string;
  email: string;
  palate_profile: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

/** Save or update the user's palate profile in Supabase. */
export async function syncPalateToSupabase(
  userId: string,
  email: string,
  palate: Record<string, unknown>
): Promise<void> {
  if (!supabase) return;
  await supabase.from("profiles").upsert({
    id: userId,
    email,
    palate_profile: palate,
    updated_at: new Date().toISOString(),
  });
}

/** Load palate profile from Supabase for a logged-in user. */
export async function loadPalateFromSupabase(
  userId: string
): Promise<Record<string, unknown> | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("profiles")
    .select("palate_profile")
    .eq("id", userId)
    .single();
  return data?.palate_profile ?? null;
}
