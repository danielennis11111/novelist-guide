import { NextResponse } from 'next/server';
import { ContentLoader } from '@/world-bible/contentLoader';
import { Character } from '@/world-bible/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const content = await ContentLoader.getRelatedContent(query);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error getting related content:', error);
    return NextResponse.json({ error: 'Failed to get related content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { character, saveVersion = false } = await request.json();

    if (!character) {
      return NextResponse.json({ error: 'Character data is required' }, { status: 400 });
    }

    await ContentLoader.saveCharacter(character as Character);
    
    if (saveVersion) {
      await ContentLoader.saveCharacterVersion(character as Character);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving character:', error);
    return NextResponse.json({ error: 'Failed to save character' }, { status: 500 });
  }
} 