import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

export class GoogleDriveService {
  private static async getClient(accessToken: string) {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.drive({ version: 'v3', auth });
  }

  static async createNovelFolder(title: string, accessToken: string) {
    const drive = await this.getClient(accessToken);
    
    const folderMetadata = {
      name: `Novel: ${title}`,
      mimeType: 'application/vnd.google-apps.folder',
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id',
    });

    return folder.data.id;
  }

  static async createDocument(title: string, folderId: string, accessToken: string) {
    const drive = await this.getClient(accessToken);
    
    const docMetadata = {
      name: title,
      mimeType: 'application/vnd.google-apps.document',
      parents: [folderId],
    };

    const doc = await drive.files.create({
      requestBody: docMetadata,
      fields: 'id',
    });

    return doc.data.id;
  }

  static async updateDocument(documentId: string, content: string, accessToken: string) {
    const drive = await this.getClient(accessToken);
    
    await drive.files.update({
      fileId: documentId,
      requestBody: {
        mimeType: 'application/vnd.google-apps.document',
      },
      media: {
        mimeType: 'text/html',
        body: content,
      },
    });
  }

  static async getDocumentContent(documentId: string, accessToken: string) {
    const drive = await this.getClient(accessToken);
    
    const response = await drive.files.export({
      fileId: documentId,
      mimeType: 'text/html',
    });

    return response.data as string;
  }
} 