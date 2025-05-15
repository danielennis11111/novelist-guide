import { NextResponse } from 'next/server';
import { GoogleCloudSetup } from '../../lib/google-cloud-setup';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, accessToken, projectName, projectId } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'createProject':
        if (!projectName) {
          return NextResponse.json(
            { error: 'Project name is required' },
            { status: 400 }
          );
        }
        const newProjectId = await GoogleCloudSetup.createProject(accessToken, projectName);
        return NextResponse.json({ projectId: newProjectId });

      case 'enableAPIs':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        await GoogleCloudSetup.enableAPIs(projectId, accessToken);
        return NextResponse.json({ success: true });

      case 'createCredentials':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        const credentials = await GoogleCloudSetup.createOAuthCredentials(projectId, accessToken);
        return NextResponse.json({ credentials });

      case 'validateSetup':
        if (!projectId) {
          return NextResponse.json(
            { error: 'Project ID is required' },
            { status: 400 }
          );
        }
        const validation = await GoogleCloudSetup.validateSetup(projectId, accessToken);
        return NextResponse.json({ validation });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Google Cloud setup error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 