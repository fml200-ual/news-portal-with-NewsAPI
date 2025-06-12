import type { NewsArticle } from '@/types';
import { getNewsByCategory as getNewsAPIArticles, searchNews as searchNewsAPI } from '@/services/newsService';
import { getScrapedArticles, searchArticles as searchScrapedArticles } from '@/services/scrapedNewsService';

// Servicio híbrido que combina NewsAPI con scraping local
export class HybridNewsService {
  
  // Combinar artículos de ambas fuentes con prioridad a NewsAPI
  private static combineArticles(newsApiArticles: NewsArticle[], scrapedArticles: NewsArticle[]): NewsArticle[] {
    const combinedArticles: NewsArticle[] = [];
    const seenUrls = new Set<string>();

    // Primero agregar artículos de NewsAPI (prioridad principal)
    newsApiArticles.forEach(article => {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        combinedArticles.push({
          ...article,
          source: 'newsapi' // Marcar la fuente
        });
      }
    });

    // Luego agregar artículos únicos del scraping
    scrapedArticles.forEach(article => {
      if (article.url && !seenUrls.has(article.url)) {
        seenUrls.add(article.url);
        combinedArticles.push({
          ...article,
          source: 'scraping', // Marcar la fuente
          // Los artículos scrapeados ya pueden tener sentiment y summary
        });
      }
    });

    // Ordenar por fecha de publicación (más recientes primero)
    return combinedArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt || 0).getTime();
      const dateB = new Date(b.publishedAt || 0).getTime();
      return dateB - dateA;
    });
  }

  // Obtener noticias por categoría combinando ambas fuentes
  static async getNewsByCategory(category: string = 'all', page: number = 1): Promise<NewsArticle[]> {
    try {
      const [newsApiArticles, scrapedArticles] = await Promise.allSettled([
        // Obtener de NewsAPI (fuente principal)
        getNewsAPIArticles(category, page),
        // Obtener del scraping local (fuente secundaria)
        getScrapedArticles(page, 10, category === 'all' ? undefined : category)
      ]);

      const newsApiData = newsApiArticles.status === 'fulfilled' ? newsApiArticles.value : [];
      const scrapedData = scrapedArticles.status === 'fulfilled' ? scrapedArticles.value : [];

      if (newsApiArticles.status === 'rejected') {
        console.warn('Error al obtener artículos de NewsAPI:', newsApiArticles.reason);
      }
        if (scrapedArticles.status === 'rejected') {
        console.warn('Error al obtener artículos scrapeados:', scrapedArticles.reason);
      }

      const combined = HybridNewsService.combineArticles(newsApiData, scrapedData);
      
      // Limitar a 20 artículos por página
      const startIndex = (page - 1) * 20;
      return combined.slice(startIndex, startIndex + 20);

    } catch (error) {
      console.error('Error en servicio híbrido:', error);
      // Si falla todo, intentar al menos devolver scraping como fallback
      try {
        return await getScrapedArticles(page, 10, category === 'all' ? undefined : category);
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        return [];
      }
    }
  }
  // Buscar artículos solo en NewsAPI (no incluye scraping)
  static async searchArticles(
    query: string, 
    page: number = 1, 
    options?: { sortBy?: 'relevancy' | 'popularity' | 'publishedAt'; language?: string }
  ): Promise<NewsArticle[]> {
    try {
      // Buscar solo en NewsAPI
      const newsApiData = await searchNewsAPI(query, options);
      
      // Marcar la fuente como NewsAPI
      return newsApiData.map(article => ({
        ...article,
        source: 'newsapi' as const
      }));

    } catch (error) {
      console.error('Error en búsqueda de NewsAPI:', error);
      return [];
    }
  }

  // Obtener estadísticas combinadas
  static async getStats() {
    try {
      // Solo contamos estadísticas del scraping ya que NewsAPI no almacena datos localmente
      const [scrapedResponse, sourcesResponse] = await Promise.allSettled([
        fetch('/api/scraped-items?limit=1'),
        fetch('/api/datasources')
      ]);

      let totalScrapedArticles = 0;
      let totalSources = 0;

      if (scrapedResponse.status === 'fulfilled') {
        const scrapedData = await scrapedResponse.value.json();
        totalScrapedArticles = scrapedData.pagination?.total || 0;
      }

      if (sourcesResponse.status === 'fulfilled') {
        const sourcesData = await sourcesResponse.value.json();
        totalSources = Array.isArray(sourcesData) ? sourcesData.length : 0;
      }

      return {
        totalScrapedArticles,
        totalSources,
        newsApiActive: true // NewsAPI siempre activo como fuente principal
      };

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        totalScrapedArticles: 0,
        totalSources: 0,
        newsApiActive: false
      };
    }
  }
}

// Exportar funciones para compatibilidad con la interfaz existente
export const getNewsByCategory = HybridNewsService.getNewsByCategory;
export const searchArticles = HybridNewsService.searchArticles;
export const getStats = HybridNewsService.getStats;
