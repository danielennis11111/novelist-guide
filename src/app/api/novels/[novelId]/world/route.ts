import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { NovelService } from '@/lib/novel-service';
import { prisma } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { novelId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const elements = await prisma.worldElement.findMany({
      where: {
        novelId: params.novelId,
        novel: {
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json(elements);
  } catch (error) {
    console.error('Error fetching world elements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { name, type, description, connections } = data;

    if (!name || !type || !description) {
      return NextResponse.json(
        { error: 'Name, type, and description are required' },
        { status: 400 }
      );
    }

    const novelService = new NovelService(session.accessToken);
    const element = await novelService.addWorldElement(params.novelId, {
      name,
      type,
      description,
      connections: connections || [],
    });

    return NextResponse.json(element);
  } catch (error) {
    console.error('Error creating world element:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 