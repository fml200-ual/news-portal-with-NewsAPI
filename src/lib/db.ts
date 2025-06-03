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
    name: 'Tech News Blog',
    type: 'url',
    value: 'https://tech.example.com/latest',
    status: 'idle',
    createdAt: new Date().toISOString(),
  });
  dataSourcesStore.push({
    id: initialDsId2,
    name: 'News API (Top Headlines US)',
    type: 'api',
    value: 'https://newsapi.org/v2/top-headlines?country=us&apiKey=YOUR_API_KEY', // Replace YOUR_API_KEY
    status: 'idle',
    createdAt: new Date().toISOString(),
  });

  scrapedDataStore.push({
    id: getNextScrapedDataId(),
    dataSourceId: initialDsId1,
    dataSourceName: 'Tech News Blog',
    rawData: JSON.stringify({ 
      title: 'AI Takes Over Software Development', 
      content: 'In a surprising turn of events, AI has become the primary force in software development...',
      author: 'Tech Reporter',
      publishedAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
    }),
    isEnriched: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastUpdatedAt: new Date(Date.now() - 86400000).toISOString(),
  });
   scrapedDataStore.push({
    id: getNextScrapedDataId(),
    dataSourceId: initialDsId2,
    dataSourceName: 'News API (Top Headlines US)',
    rawData: JSON.stringify({ 
      title: 'Global Markets Surge Amidst Economic Optimism', 
      description: 'Stock markets around the world experienced a significant uplift today as new economic data suggests a strong recovery.',
      url: 'https://news.example.com/market-surge-2024',
      source: { name: 'Global News Network' },
      publishedAt: new Date().toISOString() 
    }),
    isEnriched: true,
    sentiment: 'positive',
    processedData: JSON.stringify({
      summary: 'Positive economic indicators led to a global stock market rally.',
      tags: ['economy', 'stocks', 'optimism']
    }),
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  });
}
