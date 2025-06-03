
import { NextResponse, type NextRequest } from 'next/server';
import { newsArticleStore } from '@/lib/db'; // Updated store name
import type { NewsArticle } from '@/types'; // Updated type

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemIndex = newsArticleStore.findIndex(it => it.id === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "News article not found" }, { status: 404 });
    }

    // Simulate enrichment
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const item = newsArticleStore[itemIndex];
    item.isEnriched = true;
    
    const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    item.sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    item.summary = `This is a mock AI-generated summary for the article titled "${item.title}". It highlights key points and offers a concise overview.`;
    item.lastUpdatedAt = new Date().toISOString();

    newsArticleStore[itemIndex] = { ...item }; 

    return NextResponse.json({ message: `Successfully enriched article ${item.id}`, updatedItem: item }, { status: 200 });
  } catch (error) {
    console.error(`Failed to enrich article ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to enrich article" }, { status: 500 });
  }
}
