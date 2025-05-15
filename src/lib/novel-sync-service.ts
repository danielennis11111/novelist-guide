import { getDriveClient } from './google-cloud-setup';
import { drive_v3 } from 'googleapis';
import { adminDb } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { Novel } from '@/types/novel';
import { prisma } from './db';

export class NovelSyncService {
  private static readonly AUTO_SAVE_INTERVAL = 30000; // 30 seconds
  private static readonly DAILY_BACKUP_TIME = '00:00'; // Midnight
  private static readonly VERSION_PREFIX = 'version_';

  private drive: drive_v3.Drive;
  private novelId: string;
  private autoSaveTimer: NodeJS.Timeout | null = null;
  private lastSavedContent: string = '';
  private lastSavedTitle: string = '';
  private lastSavedDescription: string = '';

  constructor(accessToken: string, novelId: string) {
    this.drive = getDriveClient(accessToken);
    this.novelId = novelId;
  }

  async startAutoSave(
    content: string,
    title: string,
    description: string,
    onSave: (success: boolean) => void
  ) {
    this.lastSavedContent = content;
    this.lastSavedTitle = title;
    this.lastSavedDescription = description;

    // Clear any existing timer
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    // Start new auto-save timer
    this.autoSaveTimer = setInterval(async () => {
      const novel = await prisma.novel.findUnique({
        where: { id: this.novelId },
        include: { chapters: true },
      });

      if (!novel) return;

      try {
        // Save to database
        await prisma.novel.update({
          where: { id: this.novelId },
          data: {
            title,
            description,
            chapters: {
              update: {
                where: { id: novel.chapters[0].id },
                data: { content },
              },
            },
          },
        });

        // Sync with Google Drive
        await this.syncWithGoogleDrive(content, title, description);
        
        this.lastSavedContent = content;
        this.lastSavedTitle = title;
        this.lastSavedDescription = description;
        
        onSave(true);
      } catch (error) {
        console.error('Auto-save failed:', error);
        onSave(false);
      }
    }, NovelSyncService.AUTO_SAVE_INTERVAL);
  }

  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  private async syncWithGoogleDrive(content: string, title: string, description: string) {
    const novel = await prisma.novel.findUnique({
      where: { id: this.novelId },
    });

    if (!novel?.gdriveRootFolderId) return;

    // Update main document
    await this.drive.files.update({
      fileId: novel.gdriveRootFolderId,
      requestBody: {
        name: title,
        description,
      },
      media: {
        mimeType: 'text/html',
        body: content,
      },
    });

    // Create version if content has changed significantly
    if (this.hasSignificantChanges(content)) {
      await this.createVersion(content);
    }
  }

  private hasSignificantChanges(newContent: string): boolean {
    // Simple diff check - can be enhanced with more sophisticated diffing
    return newContent !== this.lastSavedContent;
  }

  private async createVersion(content: string) {
    const novelDoc = await adminDb.collection('novels').doc(this.novelId).get();
    const novel = novelDoc.data();

    if (!novel?.gdriveRootFolderId) return;

    const versionName = `${NovelSyncService.VERSION_PREFIX}${Date.now()}`;
    
    // Create version document
    const versionFile = await this.drive.files.create({
      requestBody: {
        name: versionName,
        mimeType: 'application/vnd.google-apps.document',
        parents: [novel.gdriveRootFolderId],
      },
      media: {
        mimeType: 'text/html',
        body: content,
      },
    });

    // Store version metadata in Firestore
    await adminDb.collection('novels').doc(this.novelId).collection('versions').add({
      gdriveFileId: versionFile.data.id,
      createdAt: Timestamp.now(),
    });
  }

  async createDailyBackup() {
    const novelDoc = await adminDb.collection('novels').doc(this.novelId).get();
    const novel = novelDoc.data();
    
    if (!novel) return;

    // Get the first chapter
    const chaptersSnapshot = await adminDb
      .collection('novels')
      .doc(this.novelId)
      .collection('chapters')
      .orderBy('order')
      .limit(1)
      .get();
    
    if (chaptersSnapshot.empty) return;
    const chapter = chaptersSnapshot.docs[0].data();

    const backupName = `backup_${new Date().toISOString().split('T')[0]}`;
    
    // Create backup document
    const backupFile = await this.drive.files.create({
      requestBody: {
        name: backupName,
        mimeType: 'application/vnd.google-apps.document',
        parents: [novel.gdriveRootFolderId],
      },
      media: {
        mimeType: 'text/html',
        body: chapter.content,
      },
    });

    // Store backup metadata in Firestore
    await adminDb.collection('novels').doc(this.novelId).collection('backups').add({
      gdriveFileId: backupFile.data.id,
      createdAt: Timestamp.now(),
    });
  }

  async getVersions(): Promise<{ id: string; createdAt: Date; name: string }[]> {
    const novel = await prisma.novel.findUnique({
      where: { id: this.novelId },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!novel) return [];

    return novel.versions.map(version => ({
      id: version.id,
      createdAt: version.createdAt,
      name: `Version ${new Date(version.createdAt).toLocaleString()}`,
    }));
  }

  async restoreVersion(versionId: string): Promise<string> {
    const version = await prisma.novelVersion.findUnique({
      where: { id: versionId },
    });

    if (!version) throw new Error('Version not found');

    const response = await this.drive.files.export({
      fileId: version.gdriveFileId,
      mimeType: 'text/html',
    });

    return response.data as string;
  }
} 