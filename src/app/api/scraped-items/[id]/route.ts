import { NextResponse, type NextRequest } from 'next/server';
import { scrapedDataStore } from '@/lib/db';
import type { ScrapedDataItem } from '@/types';
import { z } from 'zod';

const scrapedItemUpdateSchema = z.object({
  rawData: z.string().optional().refine(val => {
    if (val === undefined) return true;
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Raw data must be valid JSON string if provided" }),
  processedData: z.string().optional().refine(val => {
    if (val === undefined) return true;
    try { JSON.parse(val); return true; } catch { return false; }
  }, { message: "Processed data must be valid JSON string if provided" }),
  // Add other fields that can be edited
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const item = scrapedDataStore.find(it => it.id === params.id);
    if (!item) {
      return NextResponse.json({ message: "Scraped item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`Failed to fetch scraped item ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch scraped item" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = scrapedItemUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.format() }, { status: 400 });
    }

    const itemIndex = scrapedDataStore.findIndex(it => it.id === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "Scraped item not found" }, { status: 404 });
    }

    const updatedItem = { 
      ...scrapedDataStore[itemIndex], 
      ...validation.data,
      lastUpdatedAt: new Date().toISOString(),
    };
    scrapedDataStore[itemIndex] = updatedItem;
    
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error(`Failed to update scraped item ${params.id}:`, error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update scraped item" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const itemIndex = scrapedDataStore.findIndex(it => it.id === params.id);
    if (itemIndex === -1) {
      return NextResponse.json({ message: "Scraped item not found" }, { status: 404 });
    }

    scrapedDataStore.splice(itemIndex, 1);
    return NextResponse.json({ message: "Scraped item deleted" }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete scraped item ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete scraped item" }, { status: 500 });
  }
}
