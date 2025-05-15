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
  { params }: { params: { novelId: string; versionId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession;
    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    
    // Get the content of the specific version
    const response = await drive.files.get({
      fileId: params.versionId,
      alt: 'media',
    });

    if (!response.data) {
      throw new Error('Failed to get file content from Google Drive');
    }

    // The response.data will be the file content as a string
    const content = response.data.toString();

    return NextResponse.json(content);
  } catch (error) {
    console.error('Error restoring version:', error);
    return NextResponse.json(
      { error: 'Failed to restore version' },
      { status: 500 }
    );
  }
} 