export type CharacterRole = 'PROTAGONIST' | 'ANTAGONIST' | 'SUPPORTING' | 'MINOR';

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  firstAppearance: string;
  physicalDescription: string;
  personality: {
    traits: string[];
    quirks: string[];
    fears: string[];
    desires: string[];
  };
  motivation: string;
  backstory: string;
  relationships: Array<{
    characterId: string;
    relationshipType: string;
    description: string;
  }>;
  dialogueStyle: {
    commonPhrases: string[];
    tone: string;
    speechPatterns: string[];
  };
  arc: {
    startingState: string;
    keyChanges: Array<{
      trigger: string;
      change: string;
    }>;
    endingState: string;
  };
  notes: string[];
}

export interface Scene {
  id: string;
  title: string;
  charactersPresent: string[]; // Character IDs
  location: string; // Location ID
  summary: string;
  purpose: string;
  emotionalTone: string;
  keyDialogue: Array<{
    characterId: string;
    quote: string;
    significance: string;
  }>;
  props: string[]; // Prop IDs
  notes: string[];
}

export interface Location {
  id: string;
  name: string;
  type: string;
  description: {
    visual: string;
    sounds: string;
    smells: string;
    textures: string;
  };
  atmosphere: string;
  inhabitants: string[];
  history: string;
  significance: string;
  connectedLocations: string[]; // Location IDs
  notes: string[];
}

export interface Prop {
  id: string;
  name: string;
  type: string;
  description: string;
  history: string;
  significance: string;
  powers?: string[];
  currentLocation?: string; // Location ID
  currentOwner?: string; // Character ID
  notes: string[];
}

export interface Timeline {
  events: Array<{
    id: string;
    date: string;
    title: string;
    description: string;
    characters: string[]; // Character IDs
    locations: string[]; // Location IDs
    significance: string;
  }>;
}

export interface Lore {
  id: string;
  category: string;
  title: string;
  description: string;
  significance: string;
  relatedCharacters: string[]; // Character IDs
  relatedLocations: string[]; // Location IDs
  relatedProps: string[]; // Prop IDs
  notes: string[];
}

export interface Novel {
  id: string;
  title: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  characters: Character[];
  scenes: Scene[];
  locations: Location[];
  props: Prop[];
  versions: {
    id: string;
    content: string;
    createdAt: string;
    notes: string;
  }[];
} 