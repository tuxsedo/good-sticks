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
  wrapper: string;
  strength: string;
  country: string;
  vitolas: DbVitola[];
  /** Vitola shape names available for this line, deduped */
  vitolaShapes: string[];
  _search: string;
}

const brands = cigarsData as DbBrand[];

export const allCigarEntries: CigarEntry[] = brands.flatMap((b) =>
  b.lines.map((l) => {
    const shapes = [...new Set(l.vitolas.map((v) => v.shape))];
    return {
      brand: b.brand,
      lineName: l.name,
      wrapper: l.wrapper,
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
