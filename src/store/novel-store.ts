import { create } from 'zustand';
import { NovelProject, Character, WorldElement, WritingSession } from '@/types/novel';
import { GoogleDriveService } from '@/lib/google-drive';

interface NovelStore {
  currentProject: NovelProject | null;
  projects: NovelProject[];
  currentSession: WritingSession | null;
  isLoading: boolean;
  error: string | null;
  
  // Project actions
  setCurrentProject: (project: NovelProject | null) => void;
  createProject: (title: string, description: string, accessToken: string) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<NovelProject>) => Promise<void>;
  
  // Character actions
  addCharacter: (projectId: string, character: Omit<Character, 'id'>) => Promise<void>;
  updateCharacter: (projectId: string, characterId: string, updates: Partial<Character>) => Promise<void>;
  
  // World building actions
  addWorldElement: (projectId: string, element: Omit<WorldElement, 'id'>) => Promise<void>;
  updateWorldElement: (projectId: string, elementId: string, updates: Partial<WorldElement>) => Promise<void>;
  
  // Session management
  startWritingSession: (projectId: string) => void;
  endWritingSession: (notes: string) => void;
  
  // Content syncing
  syncWithGoogleDrive: (projectId: string, content: string, accessToken: string) => Promise<void>;
}

export const useNovelStore = create<NovelStore>((set, get) => ({
  currentProject: null,
  projects: [],
  currentSession: null,
  isLoading: false,
  error: null,

  setCurrentProject: (project) => set({ currentProject: project }),

  createProject: async (title, description, accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const folderId = await GoogleDriveService.createNovelFolder(title, accessToken);
      const docId = await GoogleDriveService.createDocument(title, folderId, accessToken);
      
      const newProject: NovelProject = {
        id: crypto.randomUUID(),
        userId: '', // Set from session
        title,
        description,
        googleDriveFolderId: folderId,
        mainDocumentId: docId,
        characters: [],
        worldElements: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };
      
      set((state) => ({
        projects: [...state.projects, newProject],
        currentProject: newProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to create project', isLoading: false });
    }
  },

  updateProject: async (projectId, updates) => {
    set({ isLoading: true, error: null });
    try {
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, ...updates, updatedAt: new Date().toISOString() }
            : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update project', isLoading: false });
    }
  },

  addCharacter: async (projectId, character) => {
    set((state) => {
      const newCharacter: Character = {
        ...character,
        id: crypto.randomUUID(),
        relationships: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, characters: [...p.characters, newCharacter] }
            : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, characters: [...state.currentProject.characters, newCharacter] }
            : state.currentProject,
      };
    });
  },

  updateCharacter: async (projectId, characterId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              characters: p.characters.map((c) =>
                c.id === characterId
                  ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                  : c
              ),
            }
          : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              characters: state.currentProject.characters.map((c) =>
                c.id === characterId
                  ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                  : c
              ),
            }
          : state.currentProject,
    }));
  },

  addWorldElement: async (projectId, element) => {
    set((state) => {
      const newElement: WorldElement = {
        ...element,
        id: crypto.randomUUID(),
        connections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, worldElements: [...p.worldElements, newElement] }
            : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, worldElements: [...state.currentProject.worldElements, newElement] }
            : state.currentProject,
      };
    });
  },

  updateWorldElement: async (projectId, elementId, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              worldElements: p.worldElements.map((e) =>
                e.id === elementId
                  ? { ...e, ...updates, updatedAt: new Date().toISOString() }
                  : e
              ),
            }
          : p
      ),
      currentProject:
        state.currentProject?.id === projectId
          ? {
              ...state.currentProject,
              worldElements: state.currentProject.worldElements.map((e) =>
                e.id === elementId
                  ? { ...e, ...updates, updatedAt: new Date().toISOString() }
                  : e
              ),
            }
          : state.currentProject,
    }));
  },

  startWritingSession: (projectId) => {
    const session: WritingSession = {
      id: crypto.randomUUID(),
      projectId,
      startTime: new Date().toISOString(),
      wordCount: 0,
      notes: '',
    };
    set({ currentSession: session });
  },

  endWritingSession: (notes) => {
    set((state) => {
      if (!state.currentSession) return state;
      return {
        currentSession: {
          ...state.currentSession,
          endTime: new Date().toISOString(),
          notes,
        },
      };
    });
  },

  syncWithGoogleDrive: async (projectId, content, accessToken) => {
    set({ isLoading: true, error: null });
    try {
      const project = get().projects.find((p) => p.id === projectId);
      if (!project) throw new Error('Project not found');

      await GoogleDriveService.updateDocument(project.mainDocumentId, content, accessToken);
      
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId
            ? { ...p, lastSyncedAt: new Date().toISOString() }
            : p
        ),
        currentProject:
          state.currentProject?.id === projectId
            ? { ...state.currentProject, lastSyncedAt: new Date().toISOString() }
            : state.currentProject,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to sync with Google Drive', isLoading: false });
    }
  },
})); 