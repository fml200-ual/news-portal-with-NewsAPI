"use client";

import { useState, useEffect } from "react";
import type { NewsArticle } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ExternalLink, Tag, CalendarDays, Building, Bookmark, BookmarkCheck, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { format, parseISO } from 'date-fns';
import { DEFAULT_NEWS_IMAGE, getPlaceholderImage } from '@/lib/constants';
import { useToast } from "@/hooks/use-toast";

type NewsCardProps = {
  article: NewsArticle;
  initialFavorite?: boolean;
  className?: string;
};

export function NewsCard({ article, initialFavorite = false, className = '' }: NewsCardProps) {
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isLoading, setIsLoading] = useState(false);

  // Formatear la fecha con manejo de valores undefined
  const formattedDate = article.publishedAt 
    ? format(parseISO(article.publishedAt), "MMM d, yyyy")
    : "Fecha no disponible";

  useEffect(() => {
    // Verificar si el artículo está en favoritos cuando se monta el componente
    const checkFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/news/favorites?articleId=${article.id}`);
        if (response.ok) {
          const data = await response.json();
          setIsFavorite(data.isFavorite);
        }
      } catch (error) {
        console.error('Error al verificar estado de favorito:', error);
      }
    };

    if (article.id) {
      checkFavoriteStatus();
    }
  }, [article.id]);

  const toggleFavorite = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/news/favorites', {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(
          isFavorite 
            ? { articleId: article.id }
            : { article: {
                ...article,
                publishedAt: article.publishedAt || new Date().toISOString()
              }}
        ),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar favoritos');
      }

      setIsFavorite(!isFavorite);
      toast({
        description: isFavorite 
          ? "Artículo eliminado de favoritos"
          : "Artículo guardado en favoritos",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar favoritos",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={`flex flex-col h-full shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden ${className}`}>
      <div className="relative w-full h-48">
        <Image
          src={article.imageUrl || getPlaceholderImage(article.category || 'general')}
          alt={article.title || 'News image'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (img) img.src = getPlaceholderImage(article.category || 'general');
          }}
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="font-headline text-lg leading-tight mb-1">{article.title || 'Sin título'}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0"
            onClick={toggleFavorite}
            disabled={isLoading}
          >
            {isFavorite ? (
              <BookmarkCheck className="h-5 w-5 text-primary" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
        <div className="flex items-center text-xs text-muted-foreground gap-2 mb-2">
          <Building className="h-3 w-3" />
          <span>{article.sourceName || 'Fuente desconocida'}</span>
          <span className="mx-1">|</span>
          <CalendarDays className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>        <Badge variant="secondary" className="capitalize w-fit text-xs py-0.5 px-1.5">
          <Tag className="h-3 w-3 mr-1" />
          {article.category || 'General'}
        </Badge>
          {/* Mostrar información de enriquecimiento y fuente */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {/* Badge de fuente */}
          <Badge 
            variant={article.source === 'newsapi' ? 'default' : 'secondary'} 
            className="text-xs py-0.5 px-1.5"
          >
            {article.source === 'newsapi' ? 'NewsAPI' : 'Scraping Local'}
          </Badge>
          
          {article.isEnriched && (
            <Badge variant="outline" className="text-xs py-0.5 px-1.5">
              <Sparkles className="h-3 w-3 mr-1" />
              Enriquecido
            </Badge>
          )}
          
          {article.sentiment && (
            <Badge 
              variant={
                article.sentiment.label === 'positive' ? 'default' :
                article.sentiment.label === 'negative' ? 'destructive' : 'secondary'
              }
              className="text-xs py-0.5 px-1.5"
            >
              {article.sentiment.label === 'positive' && <TrendingUp className="h-3 w-3 mr-1" />}
              {article.sentiment.label === 'negative' && <TrendingDown className="h-3 w-3 mr-1" />}
              {article.sentiment.label === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
              {article.sentiment.label === 'positive' ? 'Positivo' :
               article.sentiment.label === 'negative' ? 'Negativo' : 'Neutral'}
            </Badge>
          )}
        </div>
      </CardHeader>      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground">
          {article.summary || article.description || 'No hay descripción disponible.'}
        </p>
        {article.summary && article.description && article.summary !== article.description && (
          <details className="mt-2">
            <summary className="text-xs text-primary cursor-pointer hover:underline">
              Ver descripción original
            </summary>
            <p className="text-xs text-muted-foreground mt-1">
              {article.description}
            </p>
          </details>
        )}
      </CardContent>
      <CardFooter className="p-4 mt-auto">
        <Button className="w-full" asChild>
          <a href={article.url || '#'} target="_blank" rel="noopener noreferrer">
            Leer más <ExternalLink className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}
