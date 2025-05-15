import fs from 'fs/promises';
import path from 'path';
import { Character, Scene, Location, Prop, Lore, Novel } from './types';

export class ContentLoader {
  private static readonly CONTENT_DIR = path.join(process.cwd(), 'src', 'content');
  private static readonly NOVELS_DIR = path.join(this.CONTENT_DIR, 'novels');

  static async loadCharacters(): Promise<Character[]> {
    const charactersDir = path.join(this.CONTENT_DIR, 'characters');
    const files = await fs.readdir(charactersDir);
    const characters: Character[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(charactersDir, file), 'utf-8');
        characters.push(JSON.parse(content));
      }
    }

    return characters;
  }

  static async loadScenes(): Promise<Scene[]> {
    const scenesDir = path.join(this.CONTENT_DIR, 'scenes');
    const files = await fs.readdir(scenesDir);
    const scenes: Scene[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(scenesDir, file), 'utf-8');
        scenes.push(JSON.parse(content));
      }
    }

    return scenes;
  }

  static async saveCharacter(character: Character): Promise<void> {
    const filePath = path.join(this.CONTENT_DIR, 'characters', `${character.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(character, null, 2));
  }

  static async saveScene(scene: Scene): Promise<void> {
    const filePath = path.join(this.CONTENT_DIR, 'scenes', `${scene.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(scene, null, 2));
  }

  static async getCharacterVersions(characterId: string): Promise<string[]> {
    const versionsDir = path.join(this.CONTENT_DIR, 'versions', 'characters', characterId);
    try {
      const files = await fs.readdir(versionsDir);
      return files.filter(f => f.endsWith('.json')).sort();
    } catch {
      return [];
    }
  }

  static async saveCharacterVersion(character: Character): Promise<void> {
    const versionDir = path.join(this.CONTENT_DIR, 'versions', 'characters', character.id);
    await fs.mkdir(versionDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = path.join(versionDir, `${timestamp}.json`);
    await fs.writeFile(filePath, JSON.stringify(character, null, 2));
  }

  static async getRelatedContent(query: string): Promise<{
    characters: Character[];
    scenes: Scene[];
    locations: Location[];
    props: Prop[];
  }> {
    const [characters, scenes] = await Promise.all([
      this.loadCharacters(),
      this.loadScenes(),
    ]);

    const lowerQuery = query.toLowerCase();
    
    return {
      characters: characters.filter(char => 
        char.name.toLowerCase().includes(lowerQuery) ||
        char.physicalDescription.toLowerCase().includes(lowerQuery) ||
        char.personality.traits.some(trait => trait.toLowerCase().includes(lowerQuery)) ||
        char.dialogueStyle.commonPhrases.some(phrase => phrase.toLowerCase().includes(lowerQuery))
      ),
      scenes: scenes.filter(scene =>
        scene.title.toLowerCase().includes(lowerQuery) ||
        scene.summary.toLowerCase().includes(lowerQuery) ||
        scene.keyDialogue.some(dialogue => dialogue.quote.toLowerCase().includes(lowerQuery))
      ),
      locations: [], // Implement similar to above
      props: [], // Implement similar to above
    };
  }

  static async loadNovels(): Promise<Novel[]> {
    try {
      await fs.mkdir(this.NOVELS_DIR, { recursive: true });
      const files = await fs.readdir(this.NOVELS_DIR);
      const novels: Novel[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const content = await fs.readFile(path.join(this.NOVELS_DIR, file), 'utf-8');
          novels.push(JSON.parse(content));
        }
      }

      return novels;
    } catch (error) {
      console.error('Error loading novels:', error);
      return [];
    }
  }

  static async loadNovel(id: string): Promise<Novel | null> {
    try {
      const filePath = path.join(this.NOVELS_DIR, `${id}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error loading novel:', error);
      return null;
    }
  }

  static async createNovel(novelData: Omit<Novel, 'id' | 'characters' | 'scenes' | 'locations' | 'props' | 'versions'>): Promise<Novel> {
    await fs.mkdir(this.NOVELS_DIR, { recursive: true });
    
    const novel: Novel = {
      ...novelData,
      id: crypto.randomUUID(),
      characters: [],
      scenes: [],
      locations: [],
      props: [],
      versions: [],
    };

    const filePath = path.join(this.NOVELS_DIR, `${novel.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(novel, null, 2));

    return novel;
  }

  static async updateNovel(id: string, updates: Partial<Novel>): Promise<Novel> {
    const filePath = path.join(this.NOVELS_DIR, `${id}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const novel: Novel = JSON.parse(content);

    const updatedNovel: Novel = {
      ...novel,
      ...updates,
      id, // Ensure ID doesn't change
    };

    await fs.writeFile(filePath, JSON.stringify(updatedNovel, null, 2));
    return updatedNovel;
  }
} 