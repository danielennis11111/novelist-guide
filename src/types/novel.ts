export interface Character {
  id: string;
  name: string;
  description: string;
  relationships: CharacterRelationship[];
  traits: string[];
  arc: string;
  backstory: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CharacterRelationship {
  characterId: string;
  relatedCharacterId: string;
  type: string;
  description: string;
}

export interface WorldBuildingElement {
  id: string;
  type: 'location' | 'event' | 'item' | 'concept';
  name: string;
  description: string;
  connections: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  order: number;
  wordCount: number;
  lastSavedToGDrive?: Date;
  gdriveFileId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Novel {
  id: string;
  userId: string;
  title: string;
  description: string;
  genre: string[];
  targetAudience: string;
  status: 'draft' | 'in_progress' | 'revision' | 'complete';
  characters: Character[];
  worldBuilding: WorldBuildingElement[];
  chapters: Chapter[];
  gdriveRootFolderId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WritingStyle {
  id: string;
  userId: string;
  favoriteAuthors: string[];
  preferredGenres: string[];
  writingGoals: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIPersona {
  name: string;
  age: number;
  favoriteBooks: string[];
  writingStyle: string;
  personalityTraits: string[];
  relationshipToUser: string;
}

export interface WorldElement {
  id: string;
  name: string;
  type: 'location' | 'item' | 'concept' | 'event';
  description: string;
  connections: {
    elementId: string;
    relationship: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface NovelProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  googleDriveFolderId: string;
  mainDocumentId: string;
  characters: Character[];
  worldElements: WorldElement[];
  createdAt: string;
  updatedAt: string;
  lastSyncedAt: string;
}

export interface WritingSession {
  id: string;
  projectId: string;
  startTime: string;
  endTime?: string;
  wordCount: number;
  notes: string;
}

export interface AIFeedback {
  id: string;
  projectId: string;
  type: 'character' | 'plot' | 'worldbuilding' | 'style';
  content: string;
  context: string;
  createdAt: string;
} 