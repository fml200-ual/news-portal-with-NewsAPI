import { NextResponse, type NextRequest } from 'next/server';
import { dataSourcesStore, scrapedDataStore, getNextScrapedDataId } from '@/lib/db';
import type { ScrapedDataItem } from '@/types';

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = dataSourcesStore.find(ds => ds.id === params.id);
    if (!dataSource) {
      return NextResponse.json({ message: "Data source not found" }, { status: 404 });
    }

    // Simulate scraping
    dataSource.status = 'scraping';
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay and processing

    const newScrapedItems: ScrapedDataItem[] = [];
    for (let i = 0; i < Math.floor(Math.random() * 3) + 1; i++) { // Generate 1-3 mock items
      const newItemId = getNextScrapedDataId();
      const mockRawData = dataSource.type === 'url' 
        ? { title: `Mock Scraped Title ${i + 1} from ${dataSource.name}`, body: `This is mock content for item ${newItemId} from ${dataSource.value}` }
        : { data: `Mock API response ${i + 1} for ${dataSource.name}`, timestamp: new Date().getTime() };
      
      const newItem: ScrapedDataItem = {
        id: newItemId,
        dataSourceId: dataSource.id,
        dataSourceName: dataSource.name,
        rawData: JSON.stringify(mockRawData),
        isEnriched: false,
        createdAt: new Date().toISOString(),
        lastUpdatedAt: new Date().toISOString(),
      };
      newScrapedItems.push(newItem);
      scrapedDataStore.unshift(newItem); // Add to the beginning of the array
    }

    dataSource.status = 'success';
    dataSource.lastScrapedAt = new Date().toISOString();

    // Update the data source in the store (optional, if status changes are important)
    const dsIndex = dataSourcesStore.findIndex(ds => ds.id === params.id);
    if (dsIndex !== -1) {
      dataSourcesStore[dsIndex] = { ...dataSource };
    }
    
    return NextResponse.json({ message: `Successfully scraped ${newScrapedItems.length} items from ${dataSource.name}`, newItems: newScrapedItems, updatedDataSource: dataSource }, { status: 200 });
  } catch (error) {
    console.error(`Failed to scrape data source ${params.id}:`, error);
    // Revert status if error occurs during scraping simulation
    const dsIndex = dataSourcesStore.findIndex(ds => ds.id === params.id);
    if (dsIndex !== -1) {
      dataSourcesStore[dsIndex].status = 'error';
    }
    return NextResponse.json({ message: "Failed to scrape data source" }, { status: 500 });
  }
}
