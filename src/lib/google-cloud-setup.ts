import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );
};

export const getDriveClient = (accessToken: string) => {
  const auth = createOAuth2Client();
  auth.setCredentials({ access_token: accessToken });
  return google.drive({ version: 'v3', auth: auth as any });
};

export const createFolder = async (drive: any, name: string, parentId?: string) => {
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    ...(parentId && { parents: [parentId] }),
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return response.data.id;
};

export const createDocument = async (drive: any, name: string, parentId: string) => {
  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.document',
    parents: [parentId],
  };

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });

  return response.data.id;
};

export const updateDocument = async (drive: any, fileId: string, content: string) => {
  await drive.files.update({
    fileId,
    requestBody: {
      content,
    },
  });
};

export const readDocument = async (drive: any, fileId: string) => {
  const response = await drive.files.get({
    fileId,
    alt: 'media',
  });

  return response.data;
};

export const deleteFile = async (drive: any, fileId: string) => {
  await drive.files.delete({
    fileId,
  });
}; 