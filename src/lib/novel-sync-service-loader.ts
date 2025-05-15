// This file conditionally loads the novel sync service based on the environment
import { Novel } from '@/types/novel';

// Define the interface for the sync service
export interface NovelSyncService {
  startAutoSave: (content: string, title: string, description: string, callback: (success: boolean) => void) => void;
  stopAutoSave: () => void;
  getVersions: () => Promise<{ id: string; name: string; createdAt: Date }[]>;
  restoreVersion: (versionId: string) => Promise<string>;
}

// Create a client-side implementation that uses API routes
const clientSyncService = (accessToken: string, novelId: string): NovelSyncService => ({
  startAutoSave: (content: string, title: string, description: string, callback: (success: boolean) => void) => {
    const autoSaveInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/novels/${novelId}/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content, title, description }),
        });
        callback(response.ok);
      } catch (error) {
        console.error('Auto-save failed:', error);
        callback(false);
      }
    }, 30000); // Auto-save every 30 seconds

    // Store the interval ID for cleanup
    (window as any).__autoSaveInterval = autoSaveInterval;
  },

  stopAutoSave: () => {
    if ((window as any).__autoSaveInterval) {
      clearInterval((window as any).__autoSaveInterval);
    }
  },

  getVersions: async () => {
    const response = await fetch(`/api/novels/${novelId}/versions`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch versions');
    return response.json();
  },

  restoreVersion: async (versionId: string) => {
    const response = await fetch(`/api/novels/${novelId}/versions/${versionId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to restore version');
    return response.json();
  },
});

// Export the appropriate implementation
export function getNovelSyncService(accessToken: string, novelId: string): NovelSyncService {
  // Always use the client-side implementation in the browser
  // The actual Google API calls will be handled by the API routes
  return clientSyncService(accessToken, novelId);
} 