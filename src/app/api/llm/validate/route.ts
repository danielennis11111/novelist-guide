import { NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import OpenAI from 'openai';

async function validateOpenAIKey(apiKey: string) {
  try {
    const openai = new OpenAI({ apiKey });
    const response = await openai.models.list();
    
    const availableModels = response.data
      .filter(model => model.id.includes('gpt'))
      .map(model => model.id);

    return {
      isValid: true,
      models: availableModels,
    };
  } catch (error) {
    console.error('OpenAI validation error:', error);
    return {
      isValid: false,
      models: [],
    };
  }
}

async function validateGeminiKey(projectId: string, apiKey: string) {
  try {
    const vertex = new VertexAI({
      project: projectId,
      location: 'us-central1',
      apiEndpoint: 'us-central1-aiplatform.googleapis.com',
      credentials: {
        client_email: 'unused',
        private_key: apiKey,
      },
    });

    const model = vertex.preview.getGenerativeModel({
      model: 'gemini-pro',
    });

    const result = await model.generateText('Test connection');
    return { isValid: result.response !== undefined };
  } catch (error) {
    console.error('Gemini validation error:', error);
    return { isValid: false };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, apiKey, projectId } = body;

    if (!type || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (type === 'openai') {
      const result = await validateOpenAIKey(apiKey);
      return NextResponse.json(result);
    } else if (type === 'gemini') {
      if (!projectId) {
        return NextResponse.json(
          { error: 'Project ID is required for Gemini' },
          { status: 400 }
        );
      }
      const result = await validateGeminiKey(projectId, apiKey);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Invalid LLM type' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 