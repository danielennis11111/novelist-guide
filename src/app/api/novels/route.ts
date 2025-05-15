import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { NovelService } from '@/lib/novel-service';
import { Session } from 'next-auth';

interface CustomSession extends Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const novelsRef = collection(db, 'novels');
    const q = query(
      novelsRef,
      where('userId', '==', session.user.id),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const novels = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    return NextResponse.json({ novels });
  } catch (error) {
    console.error('Error fetching novels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch novels' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, genre, targetAudience } = data;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const novelService = new NovelService(session.accessToken);
    const novel = await novelService.createNovel(session.user.id, {
      title,
      description,
      genre: genre || [],
      targetAudience: targetAudience || 'adult',
    });

    return NextResponse.json(novel);
  } catch (error) {
    console.error('Error creating novel:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 