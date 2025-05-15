import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { novelId: string; elementId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const element = await prisma.worldElement.findFirst({
      where: {
        id: params.elementId,
        novelId: params.novelId,
        novel: {
          userId: session.user.id,
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: 'World-building element not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(element);
  } catch (error) {
    console.error('Error fetching world element:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { novelId: string; elementId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const element = await prisma.worldElement.findFirst({
      where: {
        id: params.elementId,
        novelId: params.novelId,
        novel: {
          userId: session.user.id,
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: 'World-building element not found' },
        { status: 404 }
      );
    }

    const updates = await request.json();
    const updatedElement = await prisma.worldElement.update({
      where: {
        id: params.elementId,
      },
      data: updates,
    });

    return NextResponse.json(updatedElement);
  } catch (error) {
    console.error('Error updating world element:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { novelId: string; elementId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const element = await prisma.worldElement.findFirst({
      where: {
        id: params.elementId,
        novelId: params.novelId,
        novel: {
          userId: session.user.id,
        },
      },
    });

    if (!element) {
      return NextResponse.json(
        { error: 'World-building element not found' },
        { status: 404 }
      );
    }

    await prisma.worldElement.delete({
      where: {
        id: params.elementId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting world element:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 