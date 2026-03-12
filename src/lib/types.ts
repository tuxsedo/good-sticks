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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
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
    strength: number; // 1-5
    body: number; // 1-5
    sweetness: number; // 1-5
    spice: number; // 1-5
    earthiness: number; // 1-5
    woodiness: number; // 1-5
    creaminess: number; // 1-5
    nuttiness: number; // 1-5
    leather: number; // 1-5
    pepper: number; // 1-5
    cocoa: number; // 1-5
    coffee: number; // 1-5
    fruit: number; // 1-5
    floral: number; // 1-5
  };
  notes?: string;
  reviewedAt: string;
}

export interface HumidorCigar {
  id: string;
  brand: string;
  name: string;
  vitola: Vitola;
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
