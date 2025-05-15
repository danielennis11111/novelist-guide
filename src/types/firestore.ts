import { Timestamp } from 'firebase/firestore';

export interface Novel {
  id: string;
  title: string;
  description: string;
  genre: string[];
  targetAudience: string;
  status: string;
  userId: string;
  gdriveRootFolderId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  role: string;
  background: string;
  traits: string[];
  goals: string[];
  novelId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorldElement {
  id: string;
  name: string;
  type: string;
  description: string;
  properties: Record<string, any>;
  novelId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WritingStats {
  id: string;
  userId: string;
  totalWords: number;
  dailyGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastWritingDate: Timestamp;
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WritingQuest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  reward: number;
  deadline?: Timestamp;
  userId: string;
  novelId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WritingReminder {
  id: string;
  title: string;
  description: string;
  startTime: Timestamp;
  endTime: Timestamp;
  recurrence?: string;
  userId: string;
  novelId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface APIKey {
  id: string;
  userId: string;
  openaiKey?: string;
  googleApiKey?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 