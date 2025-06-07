"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { NewsArticle } from '@/types';
import { NewsCard } from '@/components/news/news-card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Newspaper, UserCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getNewsByCategory } from '@/services/newsService';
import { SearchNews } from '@/components/news/search-news';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

const CATEGORIES = ['all', 'technology', 'business', 'sports', 'science', 'health', 'entertainment'];

export default function NewsPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const fetchNews = useCallback(async (category: string, currentPage: number, appendResults: boolean = false) => {
    if (!appendResults) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const newArticles = await getNewsByCategory(category, currentPage);
      if (newArticles.length === 0) {
        setHasMore(false);
      }
      setArticles(prev => appendResults ? [...prev, ...newArticles] : newArticles);
    } catch (e) {
      console.error(`Failed to fetch news for ${category}:`, e);
      setError(e instanceof Error ? e.message : 'Error al cargar las noticias');
      if (!appendResults) {
        setArticles([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    fetchNews(selectedCategory, 1, false);
  }, [selectedCategory, fetchNews]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && hasMore) {
          setIsLoadingMore(true);
          setPage(prev => {
            const nextPage = prev + 1;
            fetchNews(selectedCategory, nextPage, true);
            return nextPage;
          });
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [selectedCategory, isLoading, isLoadingMore, hasMore, fetchNews]);

  const handleTabChange = (value: string) => {
    setSelectedCategory(value);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => router.push('/profile')}
          >
            <UserCircle className="w-4 h-4" />
            Mi Perfil
          </Button>
        </div>
        <div className="text-center">
          <h1 className="text-4xl lg:text-5xl font-headline font-bold text-primary mb-2 flex items-center justify-center">
            <Newspaper className="w-10 h-10 mr-3 text-primary" />
            Últimas Noticias
          </h1>
          <p className="text-lg text-muted-foreground">
            Explora noticias por categorías o realiza una búsqueda
          </p>
        </div>
      </header>

      <div className="mb-8">
        <SearchNews />
      </div>

      <Separator className="my-8" />

      <Tabs value={selectedCategory} onValueChange={handleTabChange} className="mb-8">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {isLoading && articles.length === 0 && (
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
          <AlertTitle>Error al Cargar Noticias</AlertTitle>
          <AlertDescription>
            {error}. Por favor, intenta recargar la página o selecciona otra categoría.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && articles.length === 0 && (
        <div className="text-center py-12">
          <Newspaper className="mx-auto h-24 w-24 text-muted-foreground opacity-50 mb-4" />
          <p className="text-xl text-muted-foreground">No se encontraron artículos en la categoría &quot;{selectedCategory}&quot;.</p>
          <p className="text-sm text-muted-foreground mt-2">Intenta seleccionar otra categoría o vuelve más tarde.</p>
        </div>
      )}

      {articles.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {articles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
          
          <div ref={loadMoreRef} className="flex justify-center mt-8">
            {isLoadingMore && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Cargando más noticias...</span>
              </div>
            )}
            {!isLoadingMore && !hasMore && articles.length > 0 && (
              <p className="text-muted-foreground">No hay más noticias disponibles</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
