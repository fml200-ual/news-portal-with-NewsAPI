import { NextResponse, type NextRequest } from 'next/server';
import { scrapedDataStore } from '@/lib/db';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemIndex = scrapedDataStore.findIndex(it => it.id === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "Scraped item not found" }, { status: 404 });
    }

    // Simulate enrichment
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    const item = scrapedDataStore[itemIndex];
    item.isEnriched = true;
    // Example: Add mock sentiment
    const sentiments: Array<'positive' | 'negative' | 'neutral'> = ['positive', 'negative', 'neutral'];
    item.sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    item.processedData = JSON.stringify({
      ... (item.processedData ? JSON.parse(item.processedData) : JSON.parse(item.rawData)), // Keep existing processed or raw
      enrichmentTimestamp: new Date().toISOString(),
      mockAnalysis: "This item seems interesting based on mock analysis.",
    });
    item.lastUpdatedAt = new Date().toISOString();

    scrapedDataStore[itemIndex] = { ...item }; // Ensure update triggers re-render if needed

    return NextResponse.json({ message: `Successfully enriched item ${item.id}`, updatedItem: item }, { status: 200 });
  } catch (error) {
    console.error(`Failed to enrich item ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to enrich item" }, { status: 500 });
  }
}
