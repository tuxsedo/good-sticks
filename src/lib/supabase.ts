import { createClient } from "@supabase/supabase-js";
import type { PalateProfile, HumidorCigar, WishlistCigar, SmokeLogEntry } from "./types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env vars not set — auth and sync disabled");
}

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

// ── Auth ──────────────────────────────────────────────────────────────────────

export const sendMagicLink = (email: string) =>
  supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });

export const signOut = () => supabase.auth.signOut();

// ── Palate ────────────────────────────────────────────────────────────────────

export const getPalate = async (): Promise<PalateProfile | null> => {
  const { data } = await supabase
    .from("profiles")
    .select("palate")
    .single();
  return (data?.palate as PalateProfile) ?? null;
};

export const upsertPalate = async (palate: PalateProfile): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").upsert({ id: user.id, palate });
};

// ── Humidor ───────────────────────────────────────────────────────────────────

export const getHumidor = async (): Promise<HumidorCigar[]> => {
  const { data } = await supabase
    .from("humidor")
    .select("*")
    .order("added_at", { ascending: false });
  if (!data) return [];
  return data.map(rowToHumidorCigar);
};

export const addHumidorCigar = async (
  cigar: Omit<HumidorCigar, "id" | "addedAt">
): Promise<HumidorCigar | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("humidor")
    .insert({
      user_id: user.id,
      brand: cigar.brand,
      name: cigar.name,
      vitola: cigar.vitola ?? null,
      quantity: cigar.quantity,
      notes: cigar.notes ?? null,
      reviews: cigar.reviews ?? [],
    })
    .select()
    .single();
  if (error || !data) return null;
  return rowToHumidorCigar(data);
};

export const updateHumidorCigar = async (
  id: string,
  updates: Partial<HumidorCigar>
): Promise<void> => {
  const payload: Record<string, unknown> = {};
  if (updates.brand !== undefined) payload.brand = updates.brand;
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.vitola !== undefined) payload.vitola = updates.vitola;
  if (updates.quantity !== undefined) payload.quantity = updates.quantity;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  if (updates.reviews !== undefined) payload.reviews = updates.reviews;
  await supabase.from("humidor").update(payload).eq("id", id);
};

export const deleteHumidorCigar = async (id: string): Promise<void> => {
  await supabase.from("humidor").delete().eq("id", id);
};

// ── Wishlist ──────────────────────────────────────────────────────────────────

export const getWishlist = async (): Promise<WishlistCigar[]> => {
  const { data } = await supabase
    .from("wishlist")
    .select("*")
    .order("added_at", { ascending: false });
  if (!data) return [];
  return data.map(rowToWishlistCigar);
};

export const addWishlistCigar = async (
  cigar: Omit<WishlistCigar, "id" | "addedAt">
): Promise<WishlistCigar | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("wishlist")
    .insert({
      user_id: user.id,
      brand: cigar.brand,
      name: cigar.name,
      vitola: cigar.vitola ?? null,
      notes: cigar.notes ?? null,
    })
    .select()
    .single();
  if (error || !data) return null;
  return rowToWishlistCigar(data);
};

export const deleteWishlistCigar = async (id: string): Promise<void> => {
  await supabase.from("wishlist").delete().eq("id", id);
};

// ── Migration: localStorage → Supabase (runs once on first sign-in) ──────────

export const migrateFromLocalStorage = async (userId: string): Promise<void> => {
  const palateRaw = localStorage.getItem("gs_palate");
  const humidorRaw = localStorage.getItem("gs_humidor");
  const wishlistRaw = localStorage.getItem("gs_wishlist");

  if (!palateRaw && !humidorRaw && !wishlistRaw) return;

  try {
    if (palateRaw) {
      const palate = JSON.parse(palateRaw) as PalateProfile;
      await supabase.from("profiles").upsert({ id: userId, palate });
    }

    if (humidorRaw) {
      const humidor = JSON.parse(humidorRaw) as HumidorCigar[];
      if (humidor.length > 0) {
        await supabase.from("humidor").upsert(
          humidor.map((c) => ({
            user_id: userId,
            brand: c.brand,
            name: c.name,
            vitola: c.vitola ?? null,
            quantity: c.quantity ?? 1,
            notes: c.notes ?? null,
            reviews: c.reviews ?? [],
            added_at: c.addedAt,
          }))
        );
      }
    }

    if (wishlistRaw) {
      const wishlist = JSON.parse(wishlistRaw) as WishlistCigar[];
      if (wishlist.length > 0) {
        await supabase.from("wishlist").upsert(
          wishlist.map((c) => ({
            user_id: userId,
            brand: c.brand,
            name: c.name,
            vitola: c.vitola ?? null,
            notes: c.notes ?? null,
            added_at: c.addedAt,
          }))
        );
      }
    }

    // Only clear after all writes succeed
    localStorage.removeItem("gs_palate");
    localStorage.removeItem("gs_humidor");
    localStorage.removeItem("gs_wishlist");
  } catch (err) {
    console.error("Migration failed — localStorage preserved:", err);
  }
};

// ── Smoke Log ─────────────────────────────────────────────────────────────────

export const getSmokeLog = async (): Promise<SmokeLogEntry[]> => {
  const { data } = await supabase
    .from("smoke_log")
    .select("*")
    .order("smoked_at", { ascending: false })
    .limit(10);
  if (!data) return [];
  return data.map(rowToSmokeLogEntry);
};

export const addSmokeLog = async (
  entry: Omit<SmokeLogEntry, "id" | "smokedAt">
): Promise<SmokeLogEntry | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from("smoke_log")
    .insert({
      user_id: user.id,
      brand: entry.brand,
      name: entry.name,
      vitola: entry.vitola ?? null,
      rating: entry.rating,
      note: entry.note ?? null,
      draw: entry.draw ?? null,
      burn: entry.burn ?? null,
      construction: entry.construction ?? null,
    })
    .select()
    .single();
  if (error) {
    console.error("addSmokeLog error:", error.message);
    return null;
  }
  if (!data) return null;
  return rowToSmokeLogEntry(data);
};

export const updateSmokeLog = async (
  id: string,
  updates: Partial<Omit<SmokeLogEntry, "id" | "smokedAt">>
): Promise<SmokeLogEntry | null> => {
  const row: Record<string, unknown> = {};
  if (updates.rating !== undefined) row.rating = updates.rating;
  if (updates.note !== undefined) row.note = updates.note || null;
  if (updates.draw !== undefined) row.draw = updates.draw ?? null;
  if (updates.burn !== undefined) row.burn = updates.burn ?? null;
  if (updates.construction !== undefined) row.construction = updates.construction ?? null;
  const { data, error } = await supabase
    .from("smoke_log")
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) {
    console.error("updateSmokeLog error:", error.message);
    return null;
  }
  if (!data) return null;
  return rowToSmokeLogEntry(data);
};

export const deleteSmokeLog = async (id: string): Promise<void> => {
  await supabase.from("smoke_log").delete().eq("id", id);
};

// ── Row mappers ───────────────────────────────────────────────────────────────

function rowToHumidorCigar(row: Record<string, unknown>): HumidorCigar {
  return {
    id: row.id as string,
    brand: row.brand as string,
    name: row.name as string,
    vitola: (row.vitola as string) ?? undefined,
    quantity: (row.quantity as number) ?? 1,
    notes: (row.notes as string) ?? undefined,
    reviews: (row.reviews as HumidorCigar["reviews"]) ?? [],
    addedAt: row.added_at as string,
  };
}

function rowToWishlistCigar(row: Record<string, unknown>): WishlistCigar {
  return {
    id: row.id as string,
    brand: row.brand as string,
    name: row.name as string,
    vitola: (row.vitola as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    addedAt: row.added_at as string,
  };
}

function rowToSmokeLogEntry(row: Record<string, unknown>): SmokeLogEntry {
  return {
    id: row.id as string,
    brand: row.brand as string,
    name: row.name as string,
    vitola: (row.vitola as string) ?? undefined,
    rating: row.rating as number,
    note: (row.note as string) ?? undefined,
    smokedAt: row.smoked_at as string,
    draw: (row.draw as number) ?? undefined,
    burn: (row.burn as number) ?? undefined,
    construction: (row.construction as number) ?? undefined,
  };
}
