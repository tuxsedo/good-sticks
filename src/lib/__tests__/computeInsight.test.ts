import { describe, it, expect } from "vitest";
import type { SmokeLogEntry } from "../types";

// computeInsight is not exported from SmokeLog.tsx (it's a module-private
// helper), so we duplicate it here for testing. Any change to the function
// in SmokeLog.tsx must be reflected here.
function computeInsight(log: SmokeLogEntry[]): string {
  if (log.length < 3) return "";

  const maduros = log.filter((e) =>
    e.name.toLowerCase().includes("maduro")
  );
  const topRated = log.filter((e) => e.rating >= 4);

  if (maduros.length >= Math.ceil(log.length * 0.5)) {
    return `${maduros.length} of your last ${log.length} smokes have been maduros. That's your tell.`;
  }
  if (topRated.length >= 2) {
    const names = topRated.slice(0, 2).map((e) => `${e.brand} ${e.name}`).join(" and ");
    return `Your top-rated smokes — ${names} — point to a clear profile. Ember knows where to look.`;
  }
  return `You've logged ${log.length} smokes. Keep going — patterns are starting to emerge.`;
}

function entry(overrides: Partial<SmokeLogEntry> & { brand: string; name: string; rating: number }): SmokeLogEntry {
  return {
    id: Math.random().toString(),
    smokedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("computeInsight", () => {
  it("returns empty string for fewer than 3 entries", () => {
    expect(computeInsight([])).toBe("");
    expect(computeInsight([entry({ brand: "Padrón", name: "1964 Serie", rating: 5 })])).toBe("");
    expect(computeInsight([
      entry({ brand: "Padrón", name: "1964 Serie", rating: 5 }),
      entry({ brand: "Drew Estate", name: "Liga Privada No. 9", rating: 4 }),
    ])).toBe("");
  });

  it("returns empty string for exactly 2 entries", () => {
    const log = [
      entry({ brand: "A", name: "B", rating: 5 }),
      entry({ brand: "C", name: "D", rating: 4 }),
    ];
    expect(computeInsight(log)).toBe("");
  });

  it("returns maduro insight when ≥50% of smokes are maduros (by cigar name)", () => {
    const log = [
      entry({ brand: "Padrón", name: "1964 Maduro", rating: 5 }),
      entry({ brand: "Padrón", name: "1926 Maduro", rating: 5 }),
      entry({ brand: "Oliva", name: "Serie V Maduro", rating: 4 }),
    ];
    const result = computeInsight(log);
    expect(result).toContain("3 of your last 3 smokes have been maduros");
    expect(result).toContain("That's your tell");
  });

  it("does NOT trigger maduro insight from the note field — name only", () => {
    // "great maduro-style espresso finish" in notes should NOT fire maduro path
    const log = [
      entry({ brand: "Rocky Patel", name: "Vintage 1999", rating: 4, note: "Tastes like a maduro" }),
      entry({ brand: "Arturo Fuente", name: "Opus X", rating: 5, note: "maduro vibes all day" }),
      entry({ brand: "Oliva", name: "Connecticut Reserve", rating: 3 }),
    ];
    const result = computeInsight(log);
    // maduro not in any name, so should NOT return maduro insight
    expect(result).not.toContain("maduros. That's your tell");
  });

  it("returns top-rated insight when ≥2 smokes rated 4+", () => {
    const log = [
      entry({ brand: "Padrón", name: "1964 Serie", rating: 5 }),
      entry({ brand: "Drew Estate", name: "Liga Privada No. 9", rating: 4 }),
      entry({ brand: "Rocky Patel", name: "Vintage 1990", rating: 2 }),
    ];
    const result = computeInsight(log);
    expect(result).toContain("Padrón 1964 Serie");
    expect(result).toContain("Drew Estate Liga Privada No. 9");
    expect(result).toContain("point to a clear profile");
  });

  it("returns fallback pattern message when <2 top-rated and no maduro majority", () => {
    const log = [
      entry({ brand: "Padrón", name: "1964 Serie", rating: 5 }),
      entry({ brand: "Rocky Patel", name: "Vintage 1990", rating: 2 }),
      entry({ brand: "Oliva", name: "Connecticut Reserve", rating: 1 }),
    ];
    const result = computeInsight(log);
    expect(result).toContain("You've logged 3 smokes");
    expect(result).toContain("patterns are starting to emerge");
  });
});
