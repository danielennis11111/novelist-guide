import OpenAI from 'openai';
import { Novel, Character, WorldBuildingElement } from '@/types/novel';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface StoryContext {
  novel: Novel;
  currentChapter?: string;
  selectedCharacters?: Character[];
  selectedWorldElements?: WorldBuildingElement[];
}

export const generateWritingSuggestion = async (
  context: StoryContext,
  prompt: string
) => {
  const systemPrompt = `You are a helpful writing assistant. You have access to the following story context:
Title: ${context.novel.title}
Genre: ${context.novel.genre.join(', ')}
Target Audience: ${context.novel.targetAudience}

Characters: ${JSON.stringify(context.selectedCharacters || [])}
World Elements: ${JSON.stringify(context.selectedWorldElements || [])}

Current Chapter Content: ${context.currentChapter || 'Not provided'}

Important rules:
1. Never write the story for the author
2. Focus on asking questions and providing suggestions
3. Help maintain consistency with established world-building
4. Consider the target audience in all suggestions
5. Encourage character development and arc progression`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
};

export const analyzeCharacterConsistency = async (
  character: Character,
  content: string
) => {
  const prompt = `Analyze this character's portrayal in the given content for consistency with their established traits and arc:

Character:
${JSON.stringify(character)}

Content to analyze:
${content}

Please focus on:
1. Personality consistency
2. Character arc progression
3. Relationship dynamics
4. Dialogue authenticity`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a character analysis expert helping authors maintain consistency.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
};

export const generateWorldBuildingPrompts = async (
  elements: WorldBuildingElement[]
) => {
  const prompt = `Based on these world-building elements, suggest thought-provoking questions to help develop the world further:

${JSON.stringify(elements)}

Focus on:
1. Interconnections between elements
2. Cultural implications
3. Historical background
4. Potential conflicts or tensions`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a world-building expert helping authors develop rich, consistent settings.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
}; 