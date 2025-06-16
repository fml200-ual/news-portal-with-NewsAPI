import type { NewsArticle } from '@/types';

const BASE_URL = 'https://newsapi.org/v2';
const API_KEY = process.env.NEWSAPI_KEY?.trim() || process.env.NEXT_PUBLIC_NEWSAPI_KEY?.trim();

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

// Configuración de dominios españoles por categoría
const SPANISH_DOMAINS_BY_CATEGORY = {
  'general': ['elpais.com', 'elmundo.es', 'abc.es', 'lavanguardia.com', '20minutos.es'],
  'business': ['eleconomista.es', 'expansion.com', 'cincodias.elpais.com', 'elmundo.es'],
  'sports': ['marca.com', 'as.com', 'sport.es', 'mundodeportivo.com'],
  'technology': ['eleconomista.es', 'xataka.com', 'elpais.com', 'elmundo.es'],
  'entertainment': ['elpais.com', 'elmundo.es', 'hola.com', 'semana.es'],
  'health': ['elpais.com', 'elmundo.es', 'abc.es', 'lavanguardia.com'],
  'science': ['elpais.com', 'elmundo.es', 'abc.es', 'agenciasinc.es'],
  'all': ['elpais.com', 'elmundo.es', 'abc.es', 'lavanguardia.com', 'eleconomista.es', 'marca.com', 'as.com', '20minutos.es']
};

// Para compatibilidad con código existente
const SPANISH_DOMAINS = SPANISH_DOMAINS_BY_CATEGORY.all.join(',');

const INTERNATIONAL_SOURCES = [
  'bbc-news',
  'cnn',
  'reuters',
  'associated-press',
  'the-guardian',
  'abc-news',
  'bloomberg',
  'business-insider',
  'financial-times',
  'the-washington-post'
].join(',');

// Función para obtener noticias españolas por categoría específica usando múltiples dominios
const fetchSpanishNewsByCategory = async (category: string, page: number = 1): Promise<NewsArticle[]> => {
  try {
    const domainsForCategory = SPANISH_DOMAINS_BY_CATEGORY[category as keyof typeof SPANISH_DOMAINS_BY_CATEGORY] || SPANISH_DOMAINS_BY_CATEGORY.general;
    
    console.log(`Fetching Spanish news for category ${category} from domains:`, domainsForCategory);
    
    const allArticles: NewsArticle[] = [];
    
    // Hacer llamadas paralelas a cada dominio
    const promises = domainsForCategory.map(async (domain) => {
      try {
        // Usar /v2/everything con dominio específico
        const url = `${BASE_URL}/everything?domains=${domain}&language=es&sortBy=publishedAt&pageSize=10&page=${page}&apiKey=${API_KEY}`;
        
        console.log(`Fetching from domain ${domain}:`, url);
        
        const response = await fetch(url);
        if (!response.ok) {
          console.warn(`Error fetching from ${domain}: ${response.status}`);
          return [];
        }
        
        const data: NewsAPIResponse = await response.json();
        
        if (data.status !== 'ok' || !data.articles) {
          console.warn(`No articles from domain ${domain}`);
          return [];
        }
        
        console.log(`Domain ${domain} returned ${data.articles.length} articles`);
        
        return data.articles.map(article => transformArticleToNewsArticle(article, category));
      } catch (error) {
        console.error(`Error fetching from domain ${domain}:`, error);
        return [];
      }
    });
    
    // Esperar todas las promesas y combinar resultados
    const results = await Promise.all(promises);
    results.forEach(articles => allArticles.push(...articles));
    
    // Remover duplicados basados en URL
    const uniqueArticles = allArticles.filter((article, index, self) => 
      index === self.findIndex(a => a.url === article.url)
    );
    
    // Ordenar por fecha de publicación (más recientes primero)
    uniqueArticles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    console.log(`Total unique Spanish articles for category ${category}: ${uniqueArticles.length}`);
    
    return uniqueArticles.slice(0, 20); // Limitar a 20 artículos por página
  } catch (error) {
    console.error(`Error fetching Spanish news for category ${category}:`, error);
    return [];
  }
};

// Obtener noticias principales por categoría con opción de región
export const getNewsByCategory = async (
  category: string, 
  page: number = 1, 
  region: 'spanish' | 'international' | 'all' = 'all'
): Promise<NewsArticle[]> => {
  if (!API_KEY) {
    throw new Error('NewsAPI key no está configurada. Por favor, configura NEXT_PUBLIC_NEWSAPI_KEY en tu archivo .env.local');
  }

  const validCategories = ['business', 'entertainment', 'general', 'health', 'science', 'sports', 'technology', 'all'];
  if (!validCategories.includes(category)) {
    throw new Error(`Categoría inválida: ${category}`);
  }
  let articles: NewsArticle[] = [];
  
  try {
    if (region === 'spanish' || region === 'all') {
      if (category === 'all' || category === 'general') {
        // Para categoría general, usar dominios españoles con /v2/everything
        const spanishArticles = await fetchSpanishNews(category, page);
        articles = articles.concat(spanishArticles);
      } else {
        // Para categorías específicas, usar múltiples dominios españoles
        const spanishArticles = await fetchSpanishNewsByCategory(category, page);
        articles = articles.concat(spanishArticles);
      }
    }

    if (region === 'international' || region === 'all') {
      // Para fuentes internacionales, usar /v2/top-headlines con fuentes específicas
      const internationalArticles = await fetchInternationalNews(category, page);
      articles = articles.concat(internationalArticles);
    }

    // Ordenar por fecha de publicación (más recientes primero)
    articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return articles;
  } catch (error) {
    console.error('Error al obtener noticias por categoría:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error al obtener las noticias. Por favor, inténtalo de nuevo más tarde.');
  }
};

// Función para obtener noticias españolas usando /v2/everything
const fetchSpanishNews = async (category: string, page: number): Promise<NewsArticle[]> => {
  if (!API_KEY) return [];

  // Mapear categorías a términos de búsqueda en español
  const categoryTerms: Record<string, string> = {
    business: 'negocios OR empresas OR economia OR finanzas',
    entertainment: 'entretenimiento OR cine OR television OR musica OR cultura',
    general: 'noticias OR actualidad OR España',
    health: 'salud OR medicina OR bienestar OR sanidad',
    science: 'ciencia OR investigacion OR descubrimientos OR tecnologia',
    sports: 'deportes OR futbol OR baloncesto OR tenis OR olimpiadas',
    technology: 'tecnologia OR innovacion OR digital OR internet OR software',
    all: 'España OR noticias OR actualidad'
  };

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const params = new URLSearchParams({
    q: categoryTerms[category],
    domains: SPANISH_DOMAINS,
    language: 'es',
    pageSize: '20',
    page: page.toString(),
    sortBy: 'publishedAt',
    from: sevenDaysAgo.toISOString().split('T')[0],
    apiKey: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/everything?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    validateAPIResponse(response, data);
    
    if (!data.articles || !Array.isArray(data.articles)) {
      return [];
    }

    // Filtrar artículos con imágenes
    const articlesWithImages = data.articles.filter(article => article.urlToImage);
    return articlesWithImages.map(article => transformArticleToNewsArticle(article, category));
  } catch (error) {
    console.error('Error fetching Spanish news:', error);
    return [];
  }
};

// Función para obtener noticias internacionales usando /v2/top-headlines
const fetchInternationalNews = async (category: string, page: number): Promise<NewsArticle[]> => {
  if (!API_KEY) return [];

  const params = new URLSearchParams({
    sources: INTERNATIONAL_SOURCES,
    pageSize: '20',
    page: page.toString(),
    apiKey: API_KEY,
  });

  // Para top-headlines con sources no podemos usar country/category
  // Solo usamos sources para fuentes específicas internacionales

  try {
    const response = await fetch(`${BASE_URL}/top-headlines?${params}`);
    const data: NewsAPIResponse = await response.json();
    
    validateAPIResponse(response, data);
    
    if (!data.articles || !Array.isArray(data.articles)) {
      return [];
    }

    // Filtrar artículos con imágenes
    const articlesWithImages = data.articles.filter(article => article.urlToImage);
    return articlesWithImages.map(article => transformArticleToNewsArticle(article, category));
  } catch (error) {
    console.error('Error fetching international news:', error);
    return [];
  }
};

// Buscar noticias por términos y filtros con soporte de región
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
  region?: 'spanish' | 'international' | 'all'; // Región de las fuentes
}

export const searchNews = async (query: string, options: Partial<SearchNewsParams> = {}): Promise<NewsArticle[]> => {
  if (!API_KEY) {
    throw new Error('NewsAPI key no está configurada');
  }

  // Configurar idioma según la región
  let language = options.language || 'es';
  if (options.region === 'international') {
    language = 'en'; // Para noticias internacionales usar inglés
  }

  // Construir parámetros de búsqueda
  const searchParams = new URLSearchParams({
    apiKey: API_KEY,
    q: query,
    language: language,
    pageSize: (options.pageSize || 20).toString(),
  });  // Configurar fuentes según la región
  if (options.region === 'spanish') {
    // Para fuentes españolas usar dominios españoles
    searchParams.append('domains', SPANISH_DOMAINS);
  } else if (options.region === 'international') {
    // Para fuentes internacionales usar sources específicas
    if (!options.sources) {
      searchParams.append('sources', INTERNATIONAL_SOURCES);
    }
  }

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

// Búsqueda simplificada solo con término y categoría con soporte de región
export const searchNewsByCategory = async (
  category: string, 
  region: 'spanish' | 'international' | 'all' = 'all'
): Promise<NewsArticle[]> => {
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
    pageSize: 20,
    region: region
  });
};

// Búsqueda con fuentes específicas y soporte de región
export const searchNewsFromSources = async (
  query: string, 
  sourceIds: string[], 
  region: 'spanish' | 'international' | 'all' = 'all'
): Promise<NewsArticle[]> => {
  return searchNews(query, {
    sources: sourceIds.join(','),
    sortBy: 'publishedAt',
    region: region
  });
};