'use client'

// This is a wrapper around the novel sync service that checks if we're in a browser environment
// If we are, it uses API routes instead of direct calls to Google APIs

import { Novel } from '@/types/novel';

// Define the interface for the sync service
interface NovelSyncService {
  syncNovel: (novel: Novel) => Promise<void>;
  // Add other methods as needed
}

// Create a browser-safe implementation
const browserSyncService: NovelSyncService = {
  syncNovel: async (novel: Novel) => {
    // Use API routes instead of direct Google API calls
    try {
      const response = await fetch(`/api/novels/${novel.id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novel),
      });
      
      if (!response.ok) {
        throw new Error('Failed to sync novel');
      }
    } catch (error) {
      console.error('Error syncing novel:', error);
      throw error;
    }
  },
  // Implement other methods similarly
};

// Export the browser-safe implementation
export default browserSyncService; 