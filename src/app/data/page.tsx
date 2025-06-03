
"use client"; // This page will be client-rendered to handle category changes and fetching

import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Newspaper } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const CATEGORIES = ['all', 'technology', 'business', 'sports', 'science', 'health', 'entertainment'];

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchNews = useCallback(async (category: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const port = process.env.PORT || 3000;
      const baseUrl = `http://localhost:${port}`;
      const fetchUrl = category === 'all' 
        ? `${baseUrl}/api/scraped-items` 
        : `${baseUrl}/api/scraped-items?category=${category}`;
      
      const res = await fetch(fetchUrl, { cache: 'no-store' });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `Failed to fetch news for ${category}`);
      }
      const data: NewsArticle[] = await res.json();
      setArticles(data);
    } catch (e) {
      console.error(`Failed to fetch or parse news for ${category}:`, e);
      setError(e instanceof Error ? e.message : 'An unknown error occurred');
      setArticles([]); // Clear articles on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory, fetchNews]);

  const handleTabChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-2 flex items-center justify-center">
          <Newspaper className="w-10 h-10 mr-3 text-primary" />
          Latest News Articles
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse news from various categories.
        </p>
      </header>

      <Tabs value={selectedCategory} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col">
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="p-4 mt-auto">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Fetching News</AlertTitle>
          <AlertDescription>
            {error}. Please try refreshing or selecting a different category.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
          <p className="text-xl text-muted-foreground">No articles found for &quot;{selectedCategory}&quot; category.</p>
          <p className="text-sm text-muted-foreground mt-2">Try selecting another category or check back later.</p>
        </div>
      )}

      {!isLoading && !error && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
