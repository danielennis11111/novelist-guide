import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

export async function GET(
  req: NextRequest,
  { params }: { params: { novelId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapterRef = doc(db, 'novels', params.novelId, 'chapters', params.chapterId);
    const snapshot = await getDoc(chapterRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json({
      chapter: {
        ...snapshot.data(),
        id: snapshot.id,
      },
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { novelId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapterRef = doc(db, 'novels', params.novelId, 'chapters', params.chapterId);
    const snapshot = await getDoc(chapterRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const data = await req.json();
    await updateDoc(chapterRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      chapter: {
        ...data,
        id: params.chapterId,
      },
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    return NextResponse.json(
      { error: 'Failed to update chapter' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { novelId: string; chapterId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const chapterRef = doc(db, 'novels', params.novelId, 'chapters', params.chapterId);
    const snapshot = await getDoc(chapterRef);

    if (!snapshot.exists()) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    await deleteDoc(chapterRef);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    return NextResponse.json(
      { error: 'Failed to delete chapter' },
      { status: 500 }
    );
  }
} 