import { prisma } from './prisma';
import { WorldElement, Character, Novel } from '@/types/novel';

export interface WorldBibleQuest {
  id?: string;
  title: string;
  description: string;
  type: 'character' | 'world' | 'plot' | 'research';
  target: number;
  reward: number;
  completed: boolean;
  dueDate?: Date;
}

export class WorldBibleService {
  static async createWorldElement(
    novelId: string,
    element: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<WorldElement> {
    try {
      const newElement = await prisma.worldElement.create({
        data: {
          novelId,
          type: element.type,
          name: element.name,
          description: element.description,
          connections: element.connections,
        },
      });
      return newElement;
    } catch (error) {
      console.error('Error creating world element:', error);
      throw error;
    }
  }

  static async createCharacter(
    novelId: string,
    character: Omit<Character, 'id' | 'novelId' | 'createdAt' | 'updatedAt' | 'relationships'>
  ): Promise<Character> {
    return prisma.character.create({
      data: {
        ...character,
        novelId,
      },
    });
  }

  static async generateWorldBibleQuests(novelId: string): Promise<WorldBibleQuest[]> {
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        characters: true,
        worldElements: true,
      },
    });

    if (!novel) throw new Error('Novel not found');

    const quests: WorldBibleQuest[] = [];

    // Character development quests
    if (novel.characters.length < 3) {
      quests.push({
        title: 'Create Main Characters',
        description: 'Develop at least 3 main characters with detailed backgrounds',
        type: 'character',
        target: 3,
        reward: 200,
        completed: false,
      });
    }

    // World building quests
    if (novel.worldElements.length < 5) {
      quests.push({
        title: 'Build Your World',
        description: 'Create at least 5 key world elements (locations, items, concepts)',
        type: 'world',
        target: 5,
        reward: 300,
        completed: false,
      });
    }

    // Plot development quests
    quests.push({
      title: 'Plot Structure',
      description: 'Outline the main plot points of your story',
      type: 'plot',
      target: 1,
      reward: 150,
      completed: false,
    });

    // Research quests
    quests.push({
      title: 'Research Your Genre',
      description: 'Read and analyze 3 books in your target genre',
      type: 'research',
      target: 3,
      reward: 250,
      completed: false,
    });

    // Save quests to database and return with IDs
    const savedQuests = await Promise.all(
      quests.map(quest =>
        prisma.writingQuest.create({
          data: {
            userId: novel.userId,
            novelId,
            ...quest,
          },
        })
      )
    );

    return savedQuests;
  }

  static async checkQuestCompletion(
    novelId: string,
    questId: string,
    progress: number
  ): Promise<boolean> {
    const quest = await prisma.writingQuest.findUnique({
      where: { id: questId },
    });

    if (!quest || quest.completed) return false;

    if (progress >= quest.target) {
      await prisma.writingQuest.update({
        where: { id: questId },
        data: { completed: true },
      });

      return true;
    }

    return false;
  }

  static async getWorldBibleProgress(novelId: string): Promise<{
    characters: number;
    worldElements: number;
    plotPoints: number;
    researchItems: number;
  }> {
    const novel = await prisma.novel.findUnique({
      where: { id: novelId },
      include: {
        characters: true,
        worldElements: true,
      },
    });

    if (!novel) throw new Error('Novel not found');

    return {
      characters: novel.characters.length,
      worldElements: novel.worldElements.length,
      plotPoints: 0, // TODO: Implement plot points tracking
      researchItems: 0, // TODO: Implement research tracking
    };
  }

  static async updateQuest(quest: WorldBibleQuest): Promise<WorldBibleQuest> {
    try {
      const updatedQuest = await prisma.writingQuest.update({
        where: { id: quest.id },
        data: {
          title: quest.title,
          description: quest.description,
          type: quest.type,
          target: quest.target,
          reward: quest.reward,
          completed: quest.completed,
          dueDate: quest.dueDate,
        },
      });
      return updatedQuest;
    } catch (error) {
      console.error('Error updating quest:', error);
      throw error;
    }
  }

  static async getWorldElements(novelId: string): Promise<WorldElement[]> {
    try {
      const elements = await prisma.worldElement.findMany({
        where: { novelId },
        orderBy: { createdAt: 'desc' },
      });
      return elements;
    } catch (error) {
      console.error('Error getting world elements:', error);
      throw error;
    }
  }

  static async updateWorldElement(
    element: Omit<WorldElement, 'id' | 'createdAt' | 'updatedAt'> & { id: string }
  ): Promise<WorldElement> {
    try {
      const { id, ...data } = element;
      const updatedElement = await prisma.worldElement.update({
        where: { id },
        data,
      });
      return updatedElement;
    } catch (error) {
      console.error('Error updating world element:', error);
      throw error;
    }
  }

  static async deleteWorldElement(elementId: string): Promise<void> {
    try {
      await prisma.worldElement.delete({
        where: { id: elementId },
      });
    } catch (error) {
      console.error('Error deleting world element:', error);
      throw error;
    }
  }
} 