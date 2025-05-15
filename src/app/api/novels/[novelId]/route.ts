import { NextResponse } from 'next/server';
import { ContentLoader } from '@/world-bible/contentLoader';

export async function GET(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const novel = await ContentLoader.loadNovel(params.novelId);
    if (!novel) {
      return NextResponse.json({ error: 'Novel not found' }, { status: 404 });
    }
    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error loading novel:', error);
    return NextResponse.json({ error: 'Failed to load novel' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const updates = await request.json();
    const novel = await ContentLoader.updateNovel(params.novelId, updates);
    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error updating novel:', error);
    return NextResponse.json({ error: 'Failed to update novel' }, { status: 500 });
  }
} 