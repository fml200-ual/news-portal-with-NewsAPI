import type { NewsArticle } from '@/types';

const BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEXT_PUBLIC_NEWSAPI_KEY?.trim();

if (typeof window !== 'undefined' && !API_KEY) {
  console.warn('NewsAPI key no está configurada. Por favor, configura NEXT_PUBLIC_NEWSAPI_KEY en tu archivo .env.local');
}

// Tipos para los endpoints de NewsAPI
interface NewsAPISource {
  id: string | null;
  name: string;
  description: string;
  url: string;
  category: string;
  language: string;
  country: string;
}

interface NewsAPIArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsAPIResponse {
  status: string;
  totalResults?: number;
  articles?: NewsAPIArticle[];
  sources?: NewsAPISource[];
  message?: string;
  code?: string;
}

// Función auxiliar para validar la respuesta de la API
const validateAPIResponse = (response: Response, data: NewsAPIResponse) => {
  if (!response.ok) {
    if (data.code === 'rateLimited') {
      throw new Error('Has excedido el límite de peticiones. Por favor, inténtalo más tarde.');
    } else if (data.code === 'apiKeyInvalid') {
      throw new Error('La clave API no es válida.');
    } else if (data.code === 'apiKeyMissing') {
      throw new Error('Falta la clave API. Por favor, configura NEXT_PUBLIC_NEWSAPI_KEY en tu archivo .env.local');
    }
    throw new Error(data.message || 'Error al obtener datos de la API');
  }

  if (data.status !== 'ok') {
    throw new Error(data.message || 'Error en la respuesta de la API');
  }
};

const transformArticleToNewsArticle = (article: NewsAPIArticle, category: string): NewsArticle => {
  return {
    id: `na-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    dataSourceId: 'news-api',
    dataSourceName: 'NewsAPI.org',
    title: article.title,
    description: article.description,
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: article.publishedAt,
    content: article.content,
    category: category === 'all' ? 'general' : category,
    sourceName: article.source.name,
    isEnriched: false,
    createdAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
  };
};

// Obtener noticias principales por categoría
export const getNewsByCategory = async (category: string, page: number = 1): Promise<NewsArticle[]> => {
  if (!API_KEY) {
    throw new Error('NewsAPI key no está configurada. Por favor, configura NEXT_PUBLIC_NEWSAPI_KEY en tu archivo .env.local');
  }

  const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology', 'all'];
  if (!validCategories.includes(category)) {
    throw new Error(`Categoría inválida: ${category}`);
  }

  // Mapear categorías a términos de búsqueda más relevantes
  const categoryTerms: Record<string, string> = {
    business: 'negocios OR empresas OR economia OR finanzas',
    entertainment: 'entretenimiento OR cine OR television OR musica',
    general: 'noticias OR actualidad',
    health: 'salud OR medicina OR bienestar',
    science: 'ciencia OR investigacion OR descubrimientos',
    sports: 'deportes OR futbol OR olimpiadas',
    technology: 'tecnologia OR innovacion OR digital',
    all: 'noticias actualidad'
  };
  // Agregar la fecha de inicio (últimos 7 días)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const params = new URLSearchParams({
    q: categoryTerms[category],
    language: 'es',
    pageSize: '20', // Artículos por página
    page: page.toString(), // Página actual
    sortBy: 'publishedAt',
    from: sevenDaysAgo.toISOString().split('T')[0],
    apiKey: API_KEY,
  });
  try {
    // Usar el endpoint /everything en lugar de /top-headlines para búsqueda más amplia
    const response = await fetch(`${BASE_URL}/everything?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    validateAPIResponse(response, data);

    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('Formato de respuesta inválido');
    }

    // Filtrar artículos sin imágenes
    const articlesWithImages = data.articles
      .filter(article => article.urlToImage);

    return articlesWithImages.map(article => transformArticleToNewsArticle(article, category));
  } catch (error) {
    console.error('NewsAPI error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al obtener las noticias. Por favor, inténtalo de nuevo más tarde.');
  }
};

// Buscar noticias por términos y filtros
interface SearchNewsParams {
  q: string;                   // Término de búsqueda
  searchIn?: string;          // Buscar en: 'title' | 'description' | 'content'
  sources?: string;           // Lista de identificadores de fuentes separados por comas
  domains?: string;           // Lista de dominios separados por comas
  excludeDomains?: string;    // Lista de dominios a excluir
  from?: string;              // Fecha de inicio (formato: YYYY-MM-DD)
  to?: string;                // Fecha de fin (formato: YYYY-MM-DD)
  language?: string;          // Código de idioma (ejemplo: 'es')
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt';
  pageSize?: number;          // Número de resultados por página (máx: 100)
  page?: number;              // Número de página
}

export const searchNews = async (query: string, options: Partial<SearchNewsParams> = {}): Promise<NewsArticle[]> => {
  if (!API_KEY) {
    throw new Error('NewsAPI key no está configurada');
  }

  // Construir parámetros de búsqueda
  const searchParams = new URLSearchParams({
    apiKey: API_KEY,
    q: query,
    language: options.language || 'es',
    pageSize: (options.pageSize || 20).toString(),
  });

  // Añadir parámetros opcionales si están presentes
  if (options.searchIn) searchParams.append('searchIn', options.searchIn);
  if (options.sources) searchParams.append('sources', options.sources);
  if (options.domains) searchParams.append('domains', options.domains);
  if (options.excludeDomains) searchParams.append('excludeDomains', options.excludeDomains);
  if (options.from) searchParams.append('from', options.from);
  if (options.to) searchParams.append('to', options.to);
  if (options.sortBy) searchParams.append('sortBy', options.sortBy);
  if (options.page) searchParams.append('page', options.page.toString());

  try {
    const response = await fetch(`${BASE_URL}/everything?${searchParams}`);
    const data: NewsAPIResponse = await response.json();

    validateAPIResponse(response, data);

    if (!data.articles || !Array.isArray(data.articles)) {
      throw new Error('Formato de respuesta inválido');
    }

    return data.articles.map(article => transformArticleToNewsArticle(article, 'search'));
  } catch (error) {
    console.error('NewsAPI search error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al buscar noticias');
  }
};

// Ejemplo de uso:
// const bitcoinNews = await searchNews('bitcoin');
// const techNews = await searchNews('tecnología', { 
//   sortBy: 'publishedAt',
//   language: 'es',
//   domains: 'techcrunch.com,wired.com',
//   from: '2024-01-01'
// });

// Búsqueda simplificada solo con término y categoría
export const searchNewsByCategory = async (category: string): Promise<NewsArticle[]> => {
  // Mapeo de categorías a términos de búsqueda relevantes
  const categoryTerms: Record<string, string> = {
    business: 'negocios OR empresas OR economía',
    entertainment: 'entretenimiento OR cine OR música',
    general: 'actualidad OR noticias',
    health: 'salud OR medicina OR bienestar',
    science: 'ciencia OR investigación OR tecnología',
    sports: 'deportes OR fútbol OR olimpiadas',
    technology: 'tecnología OR innovación OR digital',
  };

  const searchTerm = categoryTerms[category] || category;
  return searchNews(searchTerm, {
    sortBy: 'publishedAt',
    language: 'es',
    pageSize: 20
  });
};

// Búsqueda con fuentes específicas
export const searchNewsFromSources = async (query: string, sourceIds: string[]): Promise<NewsArticle[]> => {
  return searchNews(query, {
    sources: sourceIds.join(','),
    language: 'es',
    sortBy: 'publishedAt'
  });
};