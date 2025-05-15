import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = await prisma.aPIKey.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        openaiKey: true,
        geminiKey: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apiKey || null);
  } catch (error) {
    console.error('Error fetching API keys:', error);
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
    const { openaiKey, geminiKey } = data;

    if (!openaiKey && !geminiKey) {
      return NextResponse.json(
        { error: 'At least one API key is required' },
        { status: 400 }
      );
    }

    // Delete existing API key if it exists
    await prisma.aPIKey.deleteMany({
      where: {
        userId: session.user.id,
      },
    });

    // Create new API key
    const apiKey = await prisma.aPIKey.create({
      data: {
        userId: session.user.id,
        openaiKey,
        geminiKey,
      },
      select: {
        id: true,
        openaiKey: true,
        geminiKey: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
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
    const apiKey = await prisma.aPIKey.update({
      where: {
        userId: session.user.id,
      },
      data: updates,
      select: {
        id: true,
        openaiKey: true,
        geminiKey: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(apiKey);
  } catch (error) {
    console.error('Error updating API key:', error);
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

    await prisma.aPIKey.delete({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 