
import { NextResponse, type NextRequest } from 'next/server';
import { dataSourcesStore, newsArticleStore, getNextNewsArticleId } from '@/lib/db';
import type { NewsArticle } from '@/types';

// This endpoint simulates fetching news from a source (e.g., News API)
// In a real app, this would make an actual API call.
export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = dataSourcesStore.find(ds => ds.id === params.id);
    if (!dataSource) {
      return NextResponse.json({ message: "Data source not found" }, { status: 404 });
    }

    dataSource.status = 'scraping'; // 'fetching'
    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    const newFetchedArticles: NewsArticle[] = [];
    const categories = ['technology', 'business', 'sports']; // Example categories for mock fetch
    
    // Simulate fetching a few new articles for this source
    for (let i = 0; i < Math.floor(Math.random() * 2) + 1; i++) { 
      const category = categories[Math.floor(Math.random() * categories.length)];
      const articleDate = new Date();
      const newItemId = getNextNewsArticleId();

      const newArticle: NewsArticle = {
        id: newItemId,
        dataSourceId: dataSource.id,
        dataSourceName: dataSource.name,
        title: `Newly Fetched: Latest in ${category.charAt(0).toUpperCase() + category.slice(1)} #${newsArticleStore.length + i + 1}`,
        description: `Fresh content just fetched for ${category} from ${dataSource.name}.`,
        url: `https://example.com/news/${category}/new${newItemId}`,
        imageUrl: `https://placehold.co/600x400.png?text=New+${category}`,
        publishedAt: articleDate.toISOString(),
        content: `This is newly fetched content for ${category}.`,
        category: category,
        sourceName: dataSource.name.includes("API") ? "Various Sources via API" : dataSource.name,
        isEnriched: false,
        createdAt: articleDate.toISOString(),
        lastUpdatedAt: articleDate.toISOString(),
      };
      newFetchedArticles.push(newArticle);
      newsArticleStore.unshift(newArticle); // Add to the beginning
    }

    dataSource.status = 'success';
    dataSource.lastScrapedAt = new Date().toISOString();

    const dsIndex = dataSourcesStore.findIndex(ds => ds.id === params.id);
    if (dsIndex !== -1) {
      dataSourcesStore[dsIndex] = { ...dataSource };
    }
    
    return NextResponse.json({ 
      message: `Successfully fetched ${newFetchedArticles.length} new articles from ${dataSource.name}`, 
      newItems: newFetchedArticles, 
      updatedDataSource: dataSource 
    }, { status: 200 });

  } catch (error) {
    console.error(`Failed to fetch from data source ${params.id}:`, error);
    const dsIndex = dataSourcesStore.findIndex(ds => ds.id === params.id);
    if (dsIndex !== -1) {
      dataSourcesStore[dsIndex].status = 'error';
    }
    return NextResponse.json({ message: "Failed to fetch from data source" }, { status: 500 });
  }
}
