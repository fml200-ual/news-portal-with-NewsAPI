import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle } from '@/types';

interface UseNewsOptions {
  category?: string;
  query?: string;
  initialPageSize?: number;
  region?: 'spanish' | 'international' | 'all';
}

interface UseNewsReturn {
  articles: NewsArticle[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalResults: number;
  currentPage: number;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

export const useNews = (options: UseNewsOptions = {}): UseNewsReturn => {
  const {
    category = '',
    query = '',
    initialPageSize = 20,
    region = 'all'
  } = options;

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // Función para obtener noticias desde la API
  const fetchNews = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: initialPageSize.toString(),
        ...(category && { category }),
        ...(query && { q: query }),
        ...(region && region !== 'all' && { region }),
      });

      const response = await fetch(`/api/news?${params}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: No se pudieron cargar las noticias`);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        throw new Error(data.message || 'Error al cargar las noticias');
      }

      const newArticles = data.articles || [];
      
      setTotalResults(data.totalResults || 0);
      setHasMore(newArticles.length === initialPageSize && (page * initialPageSize) < (data.totalResults || 0));

      if (append) {
        setArticles(prev => [...prev, ...newArticles]);
      } else {
        setArticles(newArticles);
      }

      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching news:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las noticias';
      setError(errorMessage);
      
      // Si es la primera carga y hay error, proporcionar artículos vacíos
      if (!append) {
        setArticles([]);
        setTotalResults(0);
        setHasMore(false);
      }
    } finally {
      setLoading(false);
    }
  }, [category, query, initialPageSize, region]);

  // Función para cargar más noticias (scroll infinito)
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    
    const nextPage = currentPage + 1;
    await fetchNews(nextPage, true);
  }, [hasMore, loading, currentPage, fetchNews]);

  // Función para refrescar las noticias
  const refresh = useCallback(async () => {
    setCurrentPage(1);
    setHasMore(true);
    await fetchNews(1, false);
  }, [fetchNews]);

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  // Cargar noticias iniciales cuando cambian las dependencias
  useEffect(() => {
    refresh();
  }, [category, query, refresh]);
  // Los artículos ya vienen ordenados del servidor por publishedAt desc
  return {
    articles, // Sin ordenamiento adicional en el cliente
    loading,
    error,
    hasMore,
    totalResults,
    currentPage,
    loadMore,
    refresh,
    clearError,
  };
};
