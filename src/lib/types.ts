export const CONVERSATION_LIMIT = 20;

export type ExperienceLevel = 'beginner' | 'getting_serious' | 'experienced' | 'veteran';
export type Strength = 'mild' | 'mild_medium' | 'medium' | 'medium_full' | 'full';
export type FlavorNote = 'cedar' | 'leather' | 'coffee' | 'dark_chocolate' | 'nuts' | 'spice' | 'earth' | 'cream' | 'pepper' | 'fruit' | 'floral' | 'sweet';
export type DrinkPairing = 'bourbon_whiskey' | 'scotch' | 'rum' | 'beer' | 'wine' | 'coffee' | 'non_alcoholic' | 'varies';

export interface PalateProfile {
  experience: ExperienceLevel;
  strength: Strength;
  loveFlavors: FlavorNote[];
  dislikeFlavors: FlavorNote[];
  drinkPairing: DrinkPairing;
  favoriteCigars: string[];
}

export interface CigarRef {
  name: string;
  brand: string;
  fromHumidor?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  cigar?: CigarRef | null;
}

export interface CigarItem {
  id: string;
  name: string;
  brand?: string;
  notes?: string;
  addedAt: string;
}

export const VITOLA_OPTIONS = [
  'Robusto',
  'Toro',
  'Churchill',
  'Corona',
  'Petit Corona',
  'Lancero',
  'Gordo',
  'Belicoso',
  'Torpedo',
  'Figurado',
  'Perfecto',
  'Lonsdale',
  'Panatela',
  'Double Corona',
  'Rothschild',
  'Corona Gorda',
  'Petit Robusto',
] as const;

export type Vitola = typeof VITOLA_OPTIONS[number];

export interface CigarReview {
  id: string;
  rating: number; // 1-5
  draw: number; // 1-5
  burn: number; // 1-5
  construction: number; // 1-5
  flavors: {
    strength: number; // 0-5
    body: number; // 0-5
    sweetness: number; // 0-5
    spice: number; // 0-5
    earthiness: number; // 0-5
  };
  notes?: string;
  reviewedAt: string;
}

export interface HumidorCigar {
  id: string;
  brand: string;
  name: string;
  vitola?: Vitola | string;
  quantity: number;
  addedAt: string;
  notes?: string;
  reviews?: CigarReview[];
}

export interface WishlistCigar {
  id: string;
  brand: string;
  name: string;
  vitola?: string;
  addedAt: string;
  notes?: string;
}

// Unified 1-5 rating scale (matches CigarReview — Vivino model).
// Sub-ratings (draw, burn, construction) are optional.
export interface SmokeLogEntry {
  id: string;
  brand: string;
  name: string;
  vitola?: string;
  rating: number;          // 1-5
  note?: string;
  smokedAt: string;        // ISO timestamp
  draw?: number;           // 1-5, optional
  burn?: number;           // 1-5, optional
  construction?: number;   // 1-5, optional
}
