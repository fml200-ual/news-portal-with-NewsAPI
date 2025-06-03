import { NextResponse } from 'next/server';
import { scrapedDataStore, dataSourcesStore } from '@/lib/db';
import type { ScrapedDataItem } from '@/types';

export async function GET() {
  try {
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Enrich with dataSourceName if not present (for display convenience)
    const enrichedScrapedData = scrapedDataStore.map(item => {
      if (!item.dataSourceName) {
        const source = dataSourcesStore.find(ds => ds.id === item.dataSourceId);
        return { ...item, dataSourceName: source ? source.name : 'Unknown Source' };
      }
      return item;
    });

    return NextResponse.json(enrichedScrapedData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  } catch (error) {
    console.error("Failed to fetch scraped items:", error);
    return NextResponse.json({ message: "Failed to fetch scraped items" }, { status: 500 });
  }
}
