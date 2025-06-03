import type { DataSource, ScrapedDataItem } from '@/types';

// In-memory store
export const dataSourcesStore: DataSource[] = [];
export const scrapedDataStore: ScrapedDataItem[] = [];

let nextDataSourceId = 1;
export const getNextDataSourceId = () => `ds-${nextDataSourceId++}`;

let nextScrapedDataId = 1;
export const getNextScrapedDataId = () => `sd-${nextScrapedDataId++}`;

// Initialize with some mock data for demonstration
if (process.env.NODE_ENV === 'development' && dataSourcesStore.length === 0) {
  const initialDsId1 = getNextDataSourceId();
  const initialDsId2 = getNextDataSourceId();
  
  dataSourcesStore.push({
    id: initialDsId1,
    name: 'Example News Site',
    type: 'url',
    value: 'https://example.com/news',
    status: 'idle',
    createdAt: new Date().toISOString(),
  });
  dataSourcesStore.push({
    id: initialDsId2,
    name: 'Public API Endpoint',
    type: 'api',
    value: 'https://api.publicapis.org/entries',
    status: 'idle',
    createdAt: new Date().toISOString(),
  });

  scrapedDataStore.push({
    id: getNextScrapedDataId(),
    dataSourceId: initialDsId1,
    dataSourceName: 'Example News Site',
    rawData: JSON.stringify({ title: 'Mock Article 1', content: 'Some news content.' }),
    isEnriched: false,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });
   scrapedDataStore.push({
    id: getNextScrapedDataId(),
    dataSourceId: initialDsId2,
    dataSourceName: 'Public API Endpoint',
    rawData: JSON.stringify({ API: "AdoptAPet", Description: "Resource to help get pets adopted" }),
    isEnriched: true,
    sentiment: 'positive',
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });
}
