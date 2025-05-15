import { Character, Scene, Location, Prop, Timeline, Lore } from './types';

export interface ChatMessage {
  id: string;
  timestamp: number;
  content: string;
  type: 'question' | 'answer' | 'reflection';
  relatedElements: {
    characters?: string[]; // Character IDs
    scenes?: string[]; // Scene IDs
    locations?: string[]; // Location IDs
    props?: string[]; // Prop IDs
  };
  context?: {
    beforeText?: string;
    afterText?: string;
    originalVersion?: string;
    currentVersion?: string;
  };
}

export interface NovelData {
  id: string;
  title: string;
  characters: Map<string, Character>;
  scenes: Map<string, Scene>;
  locations: Map<string, Location>;
  props: Map<string, Prop>;
  timeline: Timeline;
  lore: Map<string, Lore>;
  chatHistory: ChatMessage[];
  versions: Map<string, {
    timestamp: number;
    content: string;
    notes: string;
  }>;
}

class NovelStorage {
  private static instance: NovelStorage;
  private novels: Map<string, NovelData>;

  private constructor() {
    this.novels = new Map();
  }

  static getInstance(): NovelStorage {
    if (!NovelStorage.instance) {
      NovelStorage.instance = new NovelStorage();
    }
    return NovelStorage.instance;
  }

  createNovel(title: string): string {
    const id = crypto.randomUUID();
    this.novels.set(id, {
      id,
      title,
      characters: new Map(),
      scenes: new Map(),
      locations: new Map(),
      props: new Map(),
      timeline: { events: [] },
      lore: new Map(),
      chatHistory: [],
      versions: new Map(),
    });
    return id;
  }

  addCharacter(novelId: string, character: Character): void {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    novel.characters.set(character.id, character);
  }

  addScene(novelId: string, scene: Scene): void {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    novel.scenes.set(scene.id, scene);
  }

  addLocation(novelId: string, location: Location): void {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    novel.locations.set(location.id, location);
  }

  addProp(novelId: string, prop: Prop): void {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    novel.props.set(prop.id, prop);
  }

  addVersion(novelId: string, content: string, notes: string): string {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    const versionId = crypto.randomUUID();
    novel.versions.set(versionId, {
      timestamp: Date.now(),
      content,
      notes,
    });
    return versionId;
  }

  addChatMessage(novelId: string, message: ChatMessage): void {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    novel.chatHistory.push(message);
  }

  // Query methods
  findCharactersByScene(novelId: string, sceneId: string): Character[] {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    const scene = novel.scenes.get(sceneId);
    if (!scene) return [];
    return scene.charactersPresent
      .map(id => novel.characters.get(id))
      .filter((char): char is Character => char !== undefined);
  }

  findScenesByCharacter(novelId: string, characterId: string): Scene[] {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    return Array.from(novel.scenes.values())
      .filter(scene => scene.charactersPresent.includes(characterId));
  }

  findRelatedContent(novelId: string, query: string): {
    characters: Character[];
    scenes: Scene[];
    locations: Location[];
    props: Prop[];
    chatMessages: ChatMessage[];
  } {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');

    const lowerQuery = query.toLowerCase();
    
    return {
      characters: Array.from(novel.characters.values())
        .filter(char => 
          char.name.toLowerCase().includes(lowerQuery) ||
          char.dialogueStyle.commonPhrases.some(phrase => 
            phrase.toLowerCase().includes(lowerQuery)
          )
        ),
      scenes: Array.from(novel.scenes.values())
        .filter(scene => 
          scene.summary.toLowerCase().includes(lowerQuery) ||
          scene.keyDialogue.some(dialogue => 
            dialogue.quote.toLowerCase().includes(lowerQuery)
          )
        ),
      locations: Array.from(novel.locations.values())
        .filter(location => 
          location.name.toLowerCase().includes(lowerQuery) ||
          location.description.visual.toLowerCase().includes(lowerQuery)
        ),
      props: Array.from(novel.props.values())
        .filter(prop => 
          prop.name.toLowerCase().includes(lowerQuery) ||
          prop.description.toLowerCase().includes(lowerQuery)
        ),
      chatMessages: novel.chatHistory
        .filter(msg => 
          msg.content.toLowerCase().includes(lowerQuery)
        ),
    };
  }

  getVersionDiff(novelId: string, versionId1: string, versionId2: string): {
    before: string;
    after: string;
    timestamp1: number;
    timestamp2: number;
  } {
    const novel = this.novels.get(novelId);
    if (!novel) throw new Error('Novel not found');
    
    const version1 = novel.versions.get(versionId1);
    const version2 = novel.versions.get(versionId2);
    
    if (!version1 || !version2) throw new Error('Version not found');
    
    return {
      before: version1.content,
      after: version2.content,
      timestamp1: version1.timestamp,
      timestamp2: version2.timestamp,
    };
  }
}

export const novelStorage = NovelStorage.getInstance(); 