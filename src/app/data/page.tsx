
import { ScrapedDataManager } from '@/components/scraped-data/scraped-data-manager';
import type { ScrapedDataItem } from '@/types';
import { dataSourcesStore } from '@/lib/db'; // To map dataSourceName if needed for initial load

async function getScrapedData(): Promise<ScrapedDataItem[]> {
  // For server-side fetches to own API routes, relative paths are preferred.
  const res = await fetch('/api/scraped-items', { cache: 'no-store' });
  
  if (!res.ok) {
    console.error('Failed to fetch scraped items initial data:', await res.text());
    return [];
  }
  try {
    let items: ScrapedDataItem[] = await res.json();
    // Ensure dataSourceName is populated for initial display (server-side)
    // This logic is also in the API route, but good to have for SSR if API changes
    items = items.map(item => {
      if (!item.dataSourceName) {
        const source = dataSourcesStore.find(ds => ds.id === item.dataSourceId);
        return { ...item, dataSourceName: source ? source.name : 'Unknown Source' };
      }
      return item;
    });
    return items;
  } catch (e) {
    console.error('Failed to parse scraped items JSON:', e);
    return [];
  }
}

export default async function ScrapedDataPage() {
  const initialScrapedData = await getScrapedData();

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-headline font-bold text-primary">News Articles</h1>
        <p className="text-lg text-muted-foreground mt-2">
          View, filter, and manage all news articles collected from your sources. Edit or enrich items as needed.
        </p>
      </header>
      <ScrapedDataManager initialScrapedData={initialScrapedData} />
    </div>
  );
}

export const dynamic = 'force-dynamic';
