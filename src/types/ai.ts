export interface AIPersona {
  name: string;
  age: number;
  favoriteBooks: string[];
  writingStyle: string;
  personalityTraits: string[];
  relationshipToUser: string;
}

export interface AIMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

export interface AIContext {
  currentChapter?: string;
  selectedCharacterIds?: string[];
  selectedWorldElementIds?: string[];
  writingStyleId?: string;
} 