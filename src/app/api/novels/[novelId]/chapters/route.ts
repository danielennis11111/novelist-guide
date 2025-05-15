import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chaptersRef = collection(db, 'novels', params.novelId, 'chapters');
    const q = query(chaptersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const chapters = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    return NextResponse.json({ chapters });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, content, order } = data;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const novelService = new NovelService(session.accessToken);
    const chapter = await novelService.createChapter(params.novelId, {
      title,
      content: content || '',
      order: order || 1,
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error creating chapter:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 