'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { NewsCard } from './news-card';
import { searchNews } from '@/services/newsService';
import type { NewsArticle } from '@/types';

export function SearchNews() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await searchNews(searchTerm, {
        sortBy: 'publishedAt',
        language: 'es',
      });
      setArticles(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al buscar noticias');
      setArticles([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Buscar noticias..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="animate-spin">⌛</span>
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Buscar</span>
        </Button>
      </form>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && articles.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {!isLoading && !error && articles.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron resultados para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}
