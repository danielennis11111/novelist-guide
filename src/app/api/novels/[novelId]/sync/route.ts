import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
}

export async function POST(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, title, description } = await request.json();
    
    // Initialize Google Drive API
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    // Set credentials from session
    oauth2Client.setCredentials({
      access_token: session.accessToken,
      refresh_token: session.refreshToken,
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Create or update file in Google Drive
    const fileMetadata = {
      name: `${title}.txt`,
      mimeType: 'text/plain',
    };

    const media = {
      mimeType: 'text/plain',
      body: content,
    };

    // Check if file already exists
    const files = await drive.files.list({
      q: `name='${title}.txt' and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)',
    });

    let response;
    if (files.data.files && files.data.files.length > 0) {
      const fileId = files.data.files[0].id;
      if (fileId) {
        // Update existing file
        response = await drive.files.update({
          fileId,
          media,
          fields: 'id',
        });
      }
    } else {
      // Create new file
      response = await drive.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id',
      });
    }

    if (!response?.data?.id) {
      throw new Error('Failed to get file ID from Google Drive response');
    }

    return NextResponse.json({ success: true, fileId: response.data.id });
  } catch (error) {
    console.error('Error syncing novel:', error);
    return NextResponse.json(
      { error: 'Failed to sync novel' },
      { status: 500 }
    );
  }
} 