import { getDriveClient } from './google-cloud-setup';
import type { Novel, Chapter } from '@prisma/client';
import { prisma } from './db';
import { drive_v3 } from 'googleapis';
import { adminDb } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export class DriveService {
  private drive: drive_v3.Drive;

  constructor(accessToken: string) {
    this.drive = getDriveClient(accessToken);
  }

  async createNovelFolder(novel: Novel): Promise<string> {
    const fileMetadata = {
      name: novel.title,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return response.data.id || '';
  }

  async createChapterDoc(chapter: Chapter, folderId: string): Promise<string> {
    const fileMetadata = {
      name: chapter.title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId],
    };

    const response = await this.drive.files.create({
      requestBody: fileMetadata,
      fields: 'id',
    });

    return response.data.id || '';
  }

  async updateChapterContent(chapterId: string, content: string): Promise<void> {
    const chapterDoc = await adminDb.collection('chapters').doc(chapterId).get();
    const chapter = chapterDoc.data();

    if (!chapter?.gdriveFileId) {
      throw new Error('Chapter has no associated Google Drive file');
    }

    await this.drive.files.update({
      fileId: chapter.gdriveFileId,
      requestBody: {
        mimeType: 'application/vnd.google-apps.document',
      },
      media: {
        mimeType: 'text/plain',
        body: content,
      },
    });

    await adminDb.collection('chapters').doc(chapterId).update({
      content,
      lastSavedToGDrive: Timestamp.now(),
    });
  }

  async getChapterContent(fileId: string): Promise<string> {
    const response = await this.drive.files.get({
      fileId,
      alt: 'media',
    });

    return typeof response.data === 'string' ? response.data : '';
  }

  async deleteNovelFolder(folderId: string): Promise<void> {
    await this.drive.files.delete({
      fileId: folderId,
    });
  }

  async listNovelFiles(folderId: string): Promise<Array<{ id: string; name: string; }>> {
    const response = await this.drive.files.list({
      q: `'${folderId}' in parents`,
      fields: 'files(id, name)',
    });

    return (response.data.files || []).map(file => ({
      id: file.id || '',
      name: file.name || '',
    }));
  }

  async shareNovelFolder(folderId: string, email: string): Promise<void> {
    await this.drive.permissions.create({
      fileId: folderId,
      requestBody: {
        role: 'reader',
        type: 'user',
        emailAddress: email,
      },
    });
  }
} 