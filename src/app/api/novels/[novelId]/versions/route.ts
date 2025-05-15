import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { google } from 'googleapis';
import { Session } from 'next-auth';

interface ExtendedSession extends Session {
  accessToken?: string;
  refreshToken?: string;
}

export async function GET(
  request: Request,
  { params }: { params: { novelId: string } }
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
    
    // Get file revisions
    const files = await drive.files.list({
      q: `'${params.novelId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name, modifiedTime)',
      orderBy: 'modifiedTime desc',
    });

    if (!files.data.files) {
      return NextResponse.json([]);
    }

    const versions = files.data.files.map(file => ({
      id: file.id || '',
      name: file.name || 'Untitled',
      createdAt: new Date(file.modifiedTime || Date.now()),
    }));

    return NextResponse.json(versions);
  } catch (error) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch versions' },
      { status: 500 }
    );
  }
} 