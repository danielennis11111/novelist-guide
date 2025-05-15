import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const writingStyle = await prisma.writingStyle.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!writingStyle) {
      return NextResponse.json(null);
    }

    return NextResponse.json(writingStyle);
  } catch (error) {
    console.error('Error fetching writing style:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      favoriteAuthors,
      preferredGenres,
      writingGoals,
      strengthAreas,
      improvementAreas,
    } = data;

    // Delete existing writing style if it exists
    await prisma.writingStyle.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    // Create new writing style
    const writingStyle = await prisma.writingStyle.create({
      data: {
        userId: session.user.id,
        favoriteAuthors: favoriteAuthors || [],
        preferredGenres: preferredGenres || [],
        writingGoals: writingGoals || [],
        strengthAreas: strengthAreas || [],
        improvementAreas: improvementAreas || [],
      },
    });

    return NextResponse.json(writingStyle);
  } catch (error) {
    console.error('Error creating writing style:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const writingStyle = await prisma.writingStyle.update({
      where: {
        userId: session.user.id,
      },
      data: updates,
    });

    return NextResponse.json(writingStyle);
  } catch (error) {
    console.error('Error updating writing style:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.writingStyle.delete({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting writing style:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 