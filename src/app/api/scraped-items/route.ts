
import { NextResponse, type NextRequest } from 'next/server';
import { newsArticleStore, dataSourcesStore } from '@/lib/db'; // Updated store name
import type { NewsArticle } from '@/types'; // Updated type

export async function GET(request: NextRequest) {
  try {
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    let articlesToReturn = newsArticleStore.map(item => {
      if (!item.dataSourceName) {
        const source = dataSourcesStore.find(ds => ds.id === item.dataSourceId);
        return { ...item, dataSourceName: source ? source.name : 'Unknown Source' };
      }
      return item;
    });

    if (category && category !== 'all') {
      articlesToReturn = articlesToReturn.filter(article => article.category.toLowerCase() === category.toLowerCase());
    }

    return NextResponse.json(articlesToReturn.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()));
  } catch (error) {
    console.error("Failed to fetch news articles:", error);
    return NextResponse.json({ message: "Failed to fetch news articles" }, { status: 500 });
  }
}
