export interface DataSource {
  id: string;
  name: string;
  type: 'url' | 'api';
  value: string; // URL or API endpoint
  status: 'idle' | 'scraping' | 'error' | 'success';
  lastScrapedAt?: string; // ISO date string
  createdAt: string; // ISO date string
}

export interface ScrapedDataItem {
  id: string;
  dataSourceId: string;
  dataSourceName?: string; // For display convenience
  rawData: string; // Store as JSON string or appropriate format
  processedData?: string; // Store as JSON string
  isEnriched: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral'; // Example enrichment
  createdAt: string; // ISO date string
  lastUpdatedAt: string; // ISO date string
}
