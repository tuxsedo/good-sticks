// src/lib/cigars.ts
// Search utility for the local cigar database.

import cigarsData from '@/data/cigars.json';

export interface DbVitola {
  name: string;       // e.g. "Diplomatico"
  length: string;     // e.g. "7.0"
  ring_gauge: number; // e.g. 50
  shape: string;      // e.g. "Churchill"
}

export interface DbLine {
  name: string;
  wrapper: string;
  binder: string;
  filler: string;
  strength: string;
  vitolas: DbVitola[];
}

export interface DbBrand {
  brand: string;
  country_of_origin: string;
  lines: DbLine[];
}

/** A flat, searchable record — one per product line */
export interface CigarEntry {
  brand: string;
  lineName: string;
  /** Line name with brand prefix stripped — e.g. "Classic" not "Montecristo Classic" */
  displayLineName: string;
  wrapper: string;
  binder: string;
  filler: string;
  strength: string;
  country: string;
  vitolas: DbVitola[];
  /** Vitola shape names available for this line, deduped */
  vitolaShapes: string[];
  _search: string;
}

/**
 * Strips the brand name prefix from a line name when it exists.
 * "Montecristo Classic" + "Montecristo" → "Classic"
 * "Padron 1964 Anniversary" + "Padron" → "1964 Anniversary"
 * Falls back to the original lineName if stripping produces empty string.
 */
function stripBrandPrefix(brand: string, lineName: string): string {
  const prefix = brand.toLowerCase();
  const lower = lineName.toLowerCase();
  if (lower.startsWith(prefix)) {
    const stripped = lineName.slice(brand.length).trim();
    return stripped.length > 0 ? stripped : lineName;
  }
  return lineName;
}

const brands = cigarsData as DbBrand[];

export const allCigarEntries: CigarEntry[] = brands.flatMap((b) =>
  b.lines.map((l) => {
    const shapes = [...new Set(l.vitolas.map((v) => v.shape))];
    return {
      brand: b.brand,
      lineName: l.name,
      displayLineName: stripBrandPrefix(b.brand, l.name),
      wrapper: l.wrapper,
      binder: l.binder,
      filler: l.filler,
      strength: l.strength,
      country: b.country_of_origin,
      vitolas: l.vitolas,
      vitolaShapes: shapes,
      _search: `${b.brand} ${l.name} ${l.wrapper}`.toLowerCase(),
    };
  })
);

/**
 * Search cigar lines. Brand-prefix matches are ranked first.
 * Returns up to `limit` results.
 */
export function searchCigars(query: string, limit = 8): CigarEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const first: CigarEntry[] = [];
  const rest: CigarEntry[] = [];

  for (const entry of allCigarEntries) {
    if (!entry._search.includes(q)) continue;
    if (entry.brand.toLowerCase().startsWith(q)) {
      first.push(entry);
    } else {
      rest.push(entry);
    }
    if (first.length + rest.length >= limit * 3) break;
  }

  return [...first, ...rest].slice(0, limit);
}
