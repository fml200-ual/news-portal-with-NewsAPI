import type { NewsArticle } from '@/types';

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:9002' 
  : '';

// Interfaz para los artículos scrapeados de nuestra API
interface ScrapedArticle {
  id: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  imageUrl?: string;
  publishedAt?: string;
  category?: string;
  sourceName?: string;
  dataSourceId: string;
  dataSourceName: string;
  isEnriched: boolean;
  sentiment?: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  summary?: string;
  createdAt: string;
  lastUpdatedAt: string;
}

interface ScrapedItemsResponse {
  articles: ScrapedArticle[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Convertir artículo scrapeado al formato NewsArticle
const convertToNewsArticle = (scrapedArticle: ScrapedArticle): NewsArticle => {
  return {
    id: scrapedArticle.id,
    title: scrapedArticle.title,
    description: scrapedArticle.description || '',
    content: scrapedArticle.content || scrapedArticle.description || '',
    url: scrapedArticle.url,
    imageUrl: scrapedArticle.imageUrl || null,
    publishedAt: scrapedArticle.publishedAt || scrapedArticle.createdAt,
    category: scrapedArticle.category || 'general',
    sourceName: scrapedArticle.sourceName || scrapedArticle.dataSourceName,
    sentiment: scrapedArticle.sentiment,
    summary: scrapedArticle.summary,
    isEnriched: scrapedArticle.isEnriched,
    dataSourceId: scrapedArticle.dataSourceId,
    createdAt: scrapedArticle.createdAt,
    lastUpdatedAt: scrapedArticle.lastUpdatedAt
  };
};

// Obtener artículos scrapeados con filtros opcionales
export const getScrapedArticles = async (
  page: number = 1, 
  limit: number = 10,
  category?: string,
  search?: string
): Promise<NewsArticle[]> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (category && category !== 'all') {
      params.append('category', category);
    }

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await fetch(`${BASE_URL}/api/scraped-items?${params}`);
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data: ScrapedItemsResponse = await response.json();
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.warn('Respuesta inesperada de la API:', data);
      return [];
    }

    return data.articles.map(convertToNewsArticle);
  } catch (error) {
    console.error('Error al obtener artículos scrapeados:', error);
    throw new Error(
      error instanceof Error 
        ? `Error al cargar artículos: ${error.message}`
        : 'Error desconocido al cargar artículos'
    );
  }
};

// Obtener artículos por categoría (compatibilidad con interfaz existente)
export const getNewsByCategory = async (
  category: string = 'all', 
  page: number = 1
): Promise<NewsArticle[]> => {
  return getScrapedArticles(page, 10, category);
};

// Buscar artículos
export const searchArticles = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<NewsArticle[]> => {
  return getScrapedArticles(page, limit, undefined, query);
};

// Obtener un artículo específico por ID
export const getArticleById = async (id: string): Promise<NewsArticle | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/scraped-items/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.item) {
      return null;
    }

    return convertToNewsArticle(data.item);
  } catch (error) {
    console.error('Error al obtener artículo por ID:', error);
    return null;
  }
};

// Enriquecer un artículo con IA
export const enrichArticle = async (id: string): Promise<NewsArticle | null> => {
  try {
    const response = await fetch(`${BASE_URL}/api/scraped-items/${id}/enrich`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.item) {
      return null;
    }

    return convertToNewsArticle(data.item);
  } catch (error) {
    console.error('Error al enriquecer artículo:', error);
    throw new Error(
      error instanceof Error 
        ? `Error al enriquecer artículo: ${error.message}`
        : 'Error desconocido al enriquecer artículo'
    );
  }
};

// Obtener estadísticas de artículos
export const getArticleStats = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/scraped-items?limit=1`);
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }

    const data: ScrapedItemsResponse = await response.json();
    
    return {
      total: data.pagination?.total || 0,
      pages: data.pagination?.pages || 0
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { total: 0, pages: 0 };
  }
};
