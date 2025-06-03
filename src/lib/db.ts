
import type { DataSource, NewsArticle } from '@/types';

// In-memory store
export const dataSourcesStore: DataSource[] = [];
export const newsArticleStore: NewsArticle[] = []; // Renamed from scrapedDataStore

let nextDataSourceId = 1;
export const getNextDataSourceId = () => `ds-${nextDataSourceId++}`;

let nextNewsArticleId = 1; // Renamed from nextScrapedDataId
export const getNextNewsArticleId = () => `na-${nextNewsArticleId++}`; // Changed prefix for clarity

// Initialize with some mock data for demonstration
if (process.env.NODE_ENV === 'development' && dataSourcesStore.length === 0) {
  const newsApiSourceId = getNextDataSourceId();
  
  dataSourcesStore.push({
    id: newsApiSourceId,
    name: 'NewsAPI.org (Simulated)',
    type: 'api',
    value: 'https://newsapi.org/v2/top-headlines', // Example base
    status: 'idle',
    createdAt: new Date().toISOString(),
  });

  // Mock News Articles
  const categories = ['technology', 'business', 'sports', 'science', 'health', 'entertainment'];
  const mockSources = ["Tech Today", "Business Weekly", "Sports Central", "Science Now", "Health Hub", "Showbiz Times"];

  for (let i = 0; i < 20; i++) {
    const category = categories[i % categories.length];
    const sourceName = mockSources[i % mockSources.length];
    const articleDate = new Date(Date.now() - (i * 3 * 60 * 60 * 1000)); // Articles spread over last few hours/days

    newsArticleStore.push({
      id: getNextNewsArticleId(),
      dataSourceId: newsApiSourceId,
      dataSourceName: 'NewsAPI.org (Simulated)',
      title: `Exciting Development in ${category.charAt(0).toUpperCase() + category.slice(1)} #${i + 1}`,
      description: `A detailed look into the latest happenings in the world of ${category}. This article, from ${sourceName}, explores various facets and implications.`,
      url: `https://example.com/news/${category}/article${i + 1}`,
      imageUrl: `https://placehold.co/600x400.png?text=${category}+${i+1}`, // Placeholder image
      publishedAt: articleDate.toISOString(),
      content: `This is the detailed content for the article about ${category} from ${sourceName}. It would normally contain several paragraphs of text.`,
      category: category,
      sourceName: sourceName,
      isEnriched: i % 3 === 0, // Some articles are "enriched"
      sentiment: i % 3 === 0 ? (['positive', 'negative', 'neutral'] as const)[i % 3] : undefined,
      summary: i % 3 === 0 ? `This is a mock AI summary for the ${category} article.` : undefined,
      createdAt: articleDate.toISOString(),
      lastUpdatedAt: articleDate.toISOString(),
    });
  }
}
