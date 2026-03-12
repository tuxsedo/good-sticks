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
