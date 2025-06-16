'use client';

import { useNews } from '@/hooks/use-news';
import { useIntersectionObserver } from '@/hooks/use-infinite-scroll';
import { NewsCard } from './news-card';
import LoadingIndicator, { EndOfListIndicator, InlineLoadingIndicator } from './LoadingIndicator';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon, AlertCircleIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NewsListProps {
  category?: string;
  query?: string;
  initialPageSize?: number;
  region?: 'spanish' | 'international' | 'all';
}

export default function NewsList({ 
  category = '',
  query = '',
  initialPageSize = 20,
  region = 'all'
}: NewsListProps) {  const {
    articles,
    loading,
    error,
    hasMore,
    totalResults,
    loadMore,
    refresh,
    clearError,
  } = useNews({ 
    category, 
    query, 
    initialPageSize,
    region
  });

  // Ref para el elemento observador del scroll infinito
  const loadMoreRef = useIntersectionObserver(
    () => {
      if (hasMore && !loading) {
        loadMore();
      }
    },
    { threshold: 0.1, rootMargin: '100px' }
  );

  const handleRefresh = async () => {
    clearError();
    await refresh();
  };

  // Loading inicial
  if (loading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-10 bg-gray-200 rounded animate-pulse w-64"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse w-32"></div>
        </div>
        <LoadingIndicator text="Cargando noticias..." size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">
              📰 Noticias
              {category && (
                <span className="ml-2 text-sm text-gray-500 capitalize">
                  - {category}
                </span>
              )}
            </h2>
            {totalResults > 0 && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                {totalResults} encontradas
              </span>
            )}
          </div>
        </div>        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCwIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={clearError}
              className="ml-4"
            >
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de noticias */}
      {articles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <NewsCard 
                key={`${article.url}-${index}`} 
                article={article}
                className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              />
            ))}
          </div>

          {/* Indicador de carga para scroll infinito */}
          {hasMore && (
            <div ref={loadMoreRef} className="w-full">
              {loading ? (
                <InlineLoadingIndicator />
              ) : (
                <div className="flex justify-center py-8">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    📄 Cargar más noticias
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Indicador de fin de lista */}
          {!hasMore && articles.length > 0 && (
            <EndOfListIndicator />
          )}
        </>
      ) : (
        // Estado vacío
        !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron noticias
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              {category 
                ? `No hay noticias disponibles en la categoría "${category}" en este momento.`
                : 'No hay noticias disponibles en este momento.'
              }
            </p>
            <Button onClick={handleRefresh} className="flex items-center gap-2">
              <RefreshCwIcon className="h-4 w-4" />
              Intentar de nuevo
            </Button>
          </div>
        )
      )}
    </div>
  );
}