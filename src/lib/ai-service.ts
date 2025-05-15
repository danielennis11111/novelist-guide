import OpenAI from 'openai';
import { adminDb } from './firebase-admin';
import { AIPersona, AIContext } from '@/types/ai';
import { db } from './firebase';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';

export class AIService {
  private openai: OpenAI;

  constructor(userId: string) {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // Fallback key for development
    });
    this.initializeOpenAI(userId);
  }

  private async initializeOpenAI(userId: string) {
    const apiKeyDoc = await adminDb.collection('apiKeys').doc(userId).get();
    const apiKey = apiKeyDoc.data();

    if (apiKey?.openaiKey) {
      this.openai = new OpenAI({
        apiKey: apiKey.openaiKey,
      });
    }
  }

  private async getContextData(context: AIContext) {
    const [characters, worldElements, writingStyle] = await Promise.all([
      context.selectedCharacterIds
        ? Promise.all(
            context.selectedCharacterIds.map(async (id) => {
              const docRef = doc(db, 'characters', id);
              const snapshot = await getDoc(docRef);
              return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
            })
          ).then(results => results.filter(Boolean))
        : Promise.resolve([]),
      context.selectedWorldElementIds
        ? Promise.all(
            context.selectedWorldElementIds.map(async (id) => {
              const docRef = doc(db, 'worldElements', id);
              const snapshot = await getDoc(docRef);
              return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
            })
          ).then(results => results.filter(Boolean))
        : Promise.resolve([]),
      context.writingStyleId
        ? getDoc(doc(db, 'writingStyles', context.writingStyleId))
            .then(snapshot => snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null)
        : Promise.resolve(null),
    ]);

    return { characters, worldElements, writingStyle };
  }

  private createSystemPrompt(
    context: AIContext,
    contextData: Awaited<ReturnType<typeof this.getContextData>>,
    persona: AIPersona
  ): string {
    const { characters, worldElements, writingStyle } = contextData;

    return `You are acting as the user's younger self, specifically their ${persona.age}-year-old self who loves writing and reading.
Your favorite books are ${persona.favoriteBooks.join(', ')}.
Your writing style is ${persona.writingStyle}.
Your personality traits are: ${persona.personalityTraits.join(', ')}.

You have access to the following story context:
Characters: ${JSON.stringify(characters)}
World Elements: ${JSON.stringify(worldElements)}
Writing Style: ${JSON.stringify(writingStyle)}
Current Chapter Content: ${context.currentChapter || 'Not provided'}

Important rules:
1. NEVER write any part of their story for them. Your role is to guide, suggest, and help them improve.
2. Focus on asking questions that help them develop their ideas further.
3. Draw inspiration from your favorite books but encourage them to find their own voice.
4. When giving feedback, be supportive but honest, like a younger self who sees the potential in their ideas.
5. If they ask for direct writing help, remind them that they need to write it themselves, but offer to discuss character motivations, plot structure, or world-building elements.`;
  }

  async generateSuggestion(
    context: AIContext,
    prompt: string,
    persona: AIPersona
  ): Promise<string> {
    const contextData = await this.getContextData(context);

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: this.createSystemPrompt(context, contextData, persona),
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response. Please check your API key configuration.');
    }
  }

  async analyzeCharacterConsistency(
    characterId: string,
    content: string
  ): Promise<string> {
    const docRef = doc(db, 'characters', characterId);
    const snapshot = await getDoc(docRef);
    
    if (!snapshot.exists()) {
      throw new Error('Character not found');
    }

    const character = { id: snapshot.id, ...snapshot.data() };

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a character analysis expert helping authors maintain consistency.',
          },
          {
            role: 'user',
            content: `Analyze this character's portrayal in the given content for consistency with their established traits and arc:

Character:
${JSON.stringify(character)}

Content to analyze:
${content}

Please focus on:
1. Personality consistency
2. Character arc progression
3. Relationship dynamics
4. Dialogue authenticity`,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to analyze character consistency. Please check your API key configuration.');
    }
  }

  async generateWorldBuildingPrompts(
    worldElementIds: string[]
  ): Promise<string> {
    const elements = await Promise.all(
      worldElementIds.map(async (id) => {
        const docRef = doc(db, 'worldElements', id);
        const snapshot = await getDoc(docRef);
        return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
      })
    ).then(results => results.filter(Boolean));

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a world-building expert helping authors develop rich, consistent settings.',
          },
          {
            role: 'user',
            content: `Based on these world-building elements, suggest thought-provoking questions to help develop the world further:

${JSON.stringify(elements)}

Focus on:
1. Interconnections between elements
2. Cultural implications
3. Historical background
4. Potential conflicts or tensions`,
          },
        ],
        temperature: 0.8,
        max_tokens: 500,
      });

      return completion.choices[0].message.content || '';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate world-building prompts. Please check your API key configuration.');
    }
  }
} 