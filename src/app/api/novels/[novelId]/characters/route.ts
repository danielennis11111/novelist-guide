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

    const charactersRef = collection(db, 'novels', params.novelId, 'characters');
    const q = query(charactersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const characters = snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
    }));

    return NextResponse.json({ characters });
  } catch (error) {
    console.error('Error fetching characters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch characters' },
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
    const { name, description, traits, arc, backstory } = data;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const novelService = new NovelService(session.accessToken);
    const character = await novelService.addCharacter(params.novelId, {
      name,
      description,
      traits: traits || [],
      arc: arc || '',
      backstory: backstory || '',
    });

    return NextResponse.json(character);
  } catch (error) {
    console.error('Error creating character:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 