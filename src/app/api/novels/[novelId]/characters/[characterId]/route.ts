import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: { novelId: string; characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characterRef = doc(db, 'novels', params.novelId, 'characters', params.characterId);
    const snapshot = await getDoc(characterRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    return NextResponse.json({
      character: {
        ...snapshot.data(),
        id: snapshot.id,
      },
    });
  } catch (error) {
    console.error('Error fetching character:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { novelId: string; characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characterRef = doc(db, 'novels', params.novelId, 'characters', params.characterId);
    const snapshot = await getDoc(characterRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    const data = await req.json();
    await updateDoc(characterRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      character: {
        ...data,
        id: params.characterId,
      },
    });
  } catch (error) {
    console.error('Error updating character:', error);
    return NextResponse.json(
      { error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { novelId: string; characterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const characterRef = doc(db, 'novels', params.novelId, 'characters', params.characterId);
    const snapshot = await getDoc(characterRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Character not found' }, { status: 404 });
    }

    await deleteDoc(characterRef);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character:', error);
    return NextResponse.json(
      { error: 'Failed to delete character' },
      { status: 500 }
    );
  }
} 