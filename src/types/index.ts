
export interface DataSource {
  id: string;
  name: string;
  type: 'url' | 'api';
  value: string; // URL or API endpoint (e.g., News API base URL)
  status: 'idle' | 'scraping' | 'error' | 'success'; // 'scraping' could mean 'fetching'
  lastScrapedAt?: string; // ISO date string - last fetch time
  createdAt: string; // ISO date string
}

export interface NewsArticle {
  id: string;
  dataSourceId: string; // Indicates the source API (e.g., 'news-api')
  dataSourceName?: string; // For display convenience, e.g., "NewsAPI.org"
  
  title: string;
  description: string | null;
  url: string; // URL to the original article
  imageUrl: string | null; // URL for the article's image
  publishedAt: string; // ISO date string
  content: string | null; // Full content if available, otherwise snippet
  
  category: string; // e.g., 'business', 'technology', 'sports'
  sourceName: string; // Name of the news source, e.g., "CNN", "TechCrunch"

  isEnriched: boolean; // If AI processing has been done
  sentiment?: 'positive' | 'negative' | 'neutral';
  summary?: string; // AI-generated summary
  
  createdAt: string; // When this record was created in our system
  lastUpdatedAt: string; // When this record was last updated
}
