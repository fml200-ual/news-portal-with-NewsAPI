
import { NextResponse, type NextRequest } from 'next/server';
import { newsArticleStore } from '@/lib/db'; // Updated store name
import type { NewsArticle } from '@/types'; // Updated type
import { z } from 'zod';

// Schema for updating parts of a news article (less likely to be used in a simple portal)
const newsArticleUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  category: z.string().optional(),
  isEnriched: z.boolean().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional().nullable(),
  summary: z.string().optional().nullable(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = newsArticleStore.find(it => it.id === params.id);
    if (!item) {
      return NextResponse.json({ message: "News article not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Failed to fetch news article ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch news article" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = newsArticleUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.format() }, { status: 400 });
    }

    const itemIndex = newsArticleStore.findIndex(it => it.id === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "News article not found" }, { status: 404 });
    }

    const updatedItem: NewsArticle = { 
      ...newsArticleStore[itemIndex], 
      ...validation.data,
      lastUpdatedAt: new Date().toISOString(),
    };
    newsArticleStore[itemIndex] = updatedItem;
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Failed to update news article ${params.id}:`, error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update news article" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemIndex = newsArticleStore.findIndex(it => it.id === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "News article not found" }, { status: 404 });
    }

    newsArticleStore.splice(itemIndex, 1);
    return NextResponse.json({ message: "News article deleted" }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete news article ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete news article" }, { status: 500 });
  }
}
