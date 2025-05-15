export interface APIKeys {
  openai?: {
    key: string;
    model: string;
  };
  gemini?: {
    key: string;
    projectId: string;
  };
  googleCloud?: {
    projectId: string;
    clientId: string;
    clientSecret: string;
  };
}

export interface UserSettings {
  id: string;
  userId: string;
  apiKeys: APIKeys;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    autoSaveInterval: number;
    defaultPrivacy: 'private' | 'public';
    preferredLLM: 'openai' | 'gemini';
    defaultOpenAIModel: string;
  };
  googleDriveSetup: {
    isConfigured: boolean;
    rootFolderId?: string;
    lastSynced?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SetupStatus {
  google: {
    isAuthenticated: boolean;
    hasProjectSetup: boolean;
    hasAPIEnabled: boolean;
    hasDriveAccess: boolean;
  };
  llm: {
    type: 'openai' | 'gemini' | null;
    hasValidKey: boolean;
    isConfigured: boolean;
  };
} 