import { prisma } from './db';
import { DriveService } from './drive-service';
import type { Novel, Chapter, Character, WorldElement } from '@prisma/client';

export class NovelService {
  private driveService: DriveService;

  constructor(accessToken: string) {
    this.driveService = new DriveService(accessToken);
  }

  async createNovel(
    userId: string,
    data: {
      title: string;
      description: string;
      genre: string[];
      targetAudience: string;
    }
  ): Promise<Novel> {
    // Create Google Drive folder
    const folderId = await this.driveService.createNovelFolder({
      title: data.title,
    } as Novel);

    // Create novel in database
    const novel = await prisma.novel.create({
      data: {
        ...data,
        userId,
        status: 'draft',
        gdriveRootFolderId: folderId,
      },
    });

    // Create initial chapter
    await this.createChapter(novel.id, {
      title: 'Chapter 1',
      content: '',
      order: 1,
    });

    return novel;
  }

  async getNovel(novelId: string, userId: string): Promise<Novel | null> {
    return prisma.novel.findFirst({
      where: {
        id: novelId,
        userId,
      },
      include: {
        characters: {
          include: {
            relationships: true,
          },
        },
        worldElements: true,
        chapters: {
          orderBy: {
            order: 'asc',
          },
        },
      },
    });
  }

  async updateNovel(
    novelId: string,
    userId: string,
    data: Partial<Novel>
  ): Promise<Novel> {
    return prisma.novel.update({
      where: {
        id: novelId,
        userId,
      },
      data,
    });
  }

  async deleteNovel(novelId: string, userId: string): Promise<void> {
    const novel = await prisma.novel.findFirst({
      where: {
        id: novelId,
        userId,
      },
    });

    if (!novel) {
      throw new Error('Novel not found');
    }

    // Delete from Google Drive
    await this.driveService.deleteNovelFolder(novel.gdriveRootFolderId);

    // Delete from database
    await prisma.novel.delete({
      where: {
        id: novelId,
      },
    });
  }

  async createChapter(
    novelId: string,
    data: {
      title: string;
      content: string;
      order: number;
    }
  ): Promise<Chapter> {
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new Error('Novel not found');
    }

    // Create Google Doc
    const fileId = await this.driveService.createChapterDoc(
      { title: data.title } as Chapter,
      novel.gdriveRootFolderId
    );

    // Create chapter in database
    const chapter = await prisma.chapter.create({
      data: {
        ...data,
        novelId,
        wordCount: data.content.split(/\s+/).length,
        gdriveFileId: fileId,
      },
    });

    // Update content in Google Doc
    await this.driveService.updateChapterContent({
      ...chapter,
      content: data.content,
    });

    return chapter;
  }

  async updateChapter(
    chapterId: string,
    data: Partial<Chapter>
  ): Promise<Chapter> {
    const chapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: {
        ...data,
        wordCount: data.content
          ? data.content.split(/\s+/).length
          : undefined,
      },
    });

    if (data.content) {
      await this.driveService.updateChapterContent(chapter);
    }

    return chapter;
  }

  async addCharacter(
    novelId: string,
    data: Omit<Character, 'id' | 'novelId' | 'createdAt' | 'updatedAt'>
  ): Promise<Character> {
    return prisma.character.create({
      data: {
        ...data,
        novelId,
      },
    });
  }

  async addWorldElement(
    novelId: string,
    data: Omit<WorldElement, 'id' | 'novelId' | 'createdAt' | 'updatedAt'>
  ): Promise<WorldElement> {
    return prisma.worldElement.create({
      data: {
        ...data,
        novelId,
      },
    });
  }

  async shareNovel(novelId: string, email: string): Promise<void> {
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) {
      throw new Error('Novel not found');
    }

    await this.driveService.shareNovelFolder(novel.gdriveRootFolderId, email);
  }
} 