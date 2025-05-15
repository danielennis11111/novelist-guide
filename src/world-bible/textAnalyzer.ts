import { Character, Scene, Location, Prop } from './types';

export class TextAnalyzer {
  private static readonly DIALOGUE_PATTERN = /["']([^"']+)["']/g;
  private static readonly ACTION_PATTERN = /(\w+)\s+(walked|ran|smiled|frowned|laughed|said|whispered|shouted|moved|looked|felt|thought)/gi;
  private static readonly LOCATION_PATTERN = /(in|at|to)\s+the\s+([^,.]+)/gi;
  private static readonly PROP_PATTERN = /(held|carried|took|grabbed|wielded|wore)\s+(?:the|a|an)\s+([^,.]+)/gi;

  /**
   * Extracts potential character traits from a text passage
   */
  static analyzeCharacterTraits(text: string, characterName: string): Partial<Character> {
    const traits: string[] = [];
    const quirks: string[] = [];
    const commonPhrases: string[] = [];
    const speechPatterns: string[] = [];

    // Find all dialogue by or about the character
    const dialogueMatches = text.match(this.DIALOGUE_PATTERN) || [];
    const characterDialogue = dialogueMatches.filter(d => 
      text.indexOf(characterName) < text.indexOf(d) && 
      text.indexOf(characterName) > text.lastIndexOf('.', text.indexOf(d))
    );

    // Analyze dialogue patterns
    characterDialogue.forEach(dialogue => {
      const cleaned = dialogue.replace(/["']/g, '').trim();
      if (cleaned.length > 5) {
        commonPhrases.push(cleaned);
      }
      
      // Look for repeated words or phrases
      const words = cleaned.toLowerCase().split(' ');
      const uniqueWords = new Set(words);
      uniqueWords.forEach(word => {
        if (words.filter(w => w === word).length > 1) {
          speechPatterns.push(word);
        }
      });
    });

    // Find character actions
    const actionMatches = Array.from(text.matchAll(this.ACTION_PATTERN));
    actionMatches.forEach(match => {
      if (match[1].toLowerCase() === characterName.toLowerCase()) {
        traits.push(match[2].toLowerCase());
      }
    });

    return {
      name: characterName,
      personality: {
        traits: Array.from(new Set(traits)),
        quirks,
        fears: [],
        desires: []
      },
      dialogueStyle: {
        commonPhrases: Array.from(new Set(commonPhrases)),
        tone: this.analyzeTone(characterDialogue),
        speechPatterns: Array.from(new Set(speechPatterns))
      }
    };
  }

  /**
   * Analyzes the emotional tone of dialogue
   */
  private static analyzeTone(dialogue: string[]): string {
    const emotionalWords = {
      angry: ['shouted', 'yelled', 'angry', 'furious', 'rage'],
      happy: ['laughed', 'smiled', 'happy', 'joy', 'delighted'],
      sad: ['cried', 'wept', 'sad', 'miserable', 'depressed'],
      afraid: ['trembled', 'feared', 'scared', 'afraid', 'terrified'],
      neutral: ['said', 'spoke', 'replied', 'answered', 'stated']
    };

    const toneCount: Record<string, number> = {
      angry: 0,
      happy: 0,
      sad: 0,
      afraid: 0,
      neutral: 0
    };

    dialogue.forEach(d => {
      Object.entries(emotionalWords).forEach(([tone, words]) => {
        if (words.some(word => d.toLowerCase().includes(word))) {
          toneCount[tone]++;
        }
      });
    });

    return Object.entries(toneCount)
      .sort(([,a], [,b]) => b - a)[0][0];
  }

  /**
   * Extracts location details from text
   */
  static analyzeLocation(text: string): Partial<Location>[] {
    const locations: Partial<Location>[] = [];
    const locationMatches = Array.from(text.matchAll(this.LOCATION_PATTERN));

    locationMatches.forEach(match => {
      const name = match[2].trim();
      const existingLocation = locations.find(l => l.name === name);

      if (!existingLocation) {
        // Get the surrounding context (100 characters before and after)
        const start = Math.max(0, match.index! - 100);
        const end = Math.min(text.length, match.index! + match[0].length + 100);
        const context = text.slice(start, end);

        locations.push({
          name,
          description: {
            visual: context,
            sounds: '',
            smells: '',
            textures: ''
          },
          atmosphere: this.analyzeTone([context])
        });
      }
    });

    return locations;
  }

  /**
   * Extracts props/items from text
   */
  static analyzeProps(text: string): Partial<Prop>[] {
    const props: Partial<Prop>[] = [];
    const propMatches = Array.from(text.matchAll(this.PROP_PATTERN));

    propMatches.forEach(match => {
      const name = match[2].trim();
      const existingProp = props.find(p => p.name === name);

      if (!existingProp) {
        // Get the surrounding context
        const start = Math.max(0, match.index! - 100);
        const end = Math.min(text.length, match.index! + match[0].length + 100);
        const context = text.slice(start, end);

        props.push({
          name,
          type: 'ITEM',
          description: context
        });
      }
    });

    return props;
  }

  /**
   * Extracts scene information from text
   */
  static analyzeScene(text: string): Partial<Scene> {
    const characters = new Set<string>();
    const props = new Set<string>();
    const keyDialogue: Array<{characterId: string; quote: string; significance: string}> = [];

    // Extract character actions
    const actionMatches = Array.from(text.matchAll(this.ACTION_PATTERN));
    actionMatches.forEach(match => {
      characters.add(match[1]);
    });

    // Extract dialogue
    const dialogueMatches = Array.from(text.matchAll(this.DIALOGUE_PATTERN));
    dialogueMatches.forEach(match => {
      // Find the nearest character name before this dialogue
      const textBeforeDialogue = text.slice(0, match.index);
      const lastPeriod = textBeforeDialogue.lastIndexOf('.');
      const relevantText = textBeforeDialogue.slice(lastPeriod + 1);
      const actionMatch = relevantText.match(this.ACTION_PATTERN);
      const characterId = actionMatch ? actionMatch[1] : 'unknown';

      keyDialogue.push({
        characterId,
        quote: match[1],
        significance: 'Needs analysis'
      });
    });

    // Extract props
    const propMatches = Array.from(text.matchAll(this.PROP_PATTERN));
    propMatches.forEach(match => {
      props.add(match[2].trim());
    });

    return {
      charactersPresent: Array.from(characters),
      props: Array.from(props),
      keyDialogue,
      emotionalTone: this.analyzeTone(dialogueMatches.map(m => m[1]))
    };
  }
} 