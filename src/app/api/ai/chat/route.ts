import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, context, persona } = await req.json();

    // Check for API key
    const apiKeyRef = doc(db, 'apiKeys', session.user.id);
    const apiKeyDoc = await getDoc(apiKeyRef);
    
    if (!apiKeyDoc.exists()) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 400 }
      );
    }

    // Get writing style if specified
    let writingStyle = null;
    if (context.writingStyleId) {
      const styleRef = doc(db, 'writingStyles', context.writingStyleId);
      const styleDoc = await getDoc(styleRef);
      if (styleDoc.exists()) {
        writingStyle = { id: styleDoc.id, ...styleDoc.data() };
      }
    }

    const aiService = new AIService(session.user.id);
    const response = await aiService.generateSuggestion(
      { ...context, writingStyle },
      prompt,
      persona
    );

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 