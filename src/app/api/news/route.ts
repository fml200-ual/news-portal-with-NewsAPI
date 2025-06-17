import { NextResponse } from 'next/server';
import axios from 'axios';
import { Article } from '@/lib/models/Article';
import { ScrapedItem } from '@/lib/models/ScrapedItem';
import { getNewsByCategory } from '@/services/newsService';

const NEWS_API_KEY = process.env.NEWSAPI_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

async function fetchFromCache(query: string, category: string, page: number, pageSize: number, region: string = 'all') {
  // Para la categoría "Scraping", solo mostrar noticias scrapeadas
  if (category === 'scraping') {
    let scrapedQuery: any = {};
    if (query) {
      const isShortTerm = query.length <= 3;
      const searchRegex = isShortTerm 
        ? new RegExp(`\\b${query}\\b`, 'i') 
        : new RegExp(query, 'i');
        
      scrapedQuery.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { sourceName: searchRegex },
        { dataSourceName: searchRegex }
      ];
    }

    const scrapedArticles = await ScrapedItem.find(scrapedQuery)
      .sort({ publishedAt: -1 })
      .lean();

    const transformedScrapedArticles = scrapedArticles.map((item: any) => ({
      title: item.title,
      description: item.description || '',
      content: item.content || '',
      url: item.url,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      source: 'scraping',
      sourceName: item.sourceName || item.dataSourceName || 'Scraping Local',
      sourceId: item.dataSourceId,
      sourceUrl: item.originalUrl || item.url,
      category: item.category || 'general',
      language: 'es',
      isEnriched: item.isEnriched || false,
      sentiment: item.sentiment ? { label: item.sentiment } : undefined,
      summary: item.summary,
      createdAt: item.createdAt || item.scrapedAt,
      _id: item._id
    }));

    // Paginar solo artículos scrapeados
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArticles = transformedScrapedArticles.slice(startIndex, endIndex);

    return {
      articles: paginatedArticles,
      totalResults: transformedScrapedArticles.length,
      fromCache: true
    };
  }

  // Para todas las demás categorías, solo mostrar NewsAPI
  let newsApiQuery: any = { source: 'newsapi' }; // Filtrar solo NewsAPI
  if (query) {
    const isShortTerm = query.length <= 3;
    const searchRegex = isShortTerm 
      ? new RegExp(`\\b${query}\\b`, 'i') 
      : new RegExp(query, 'i');
    
    newsApiQuery.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { content: searchRegex },
      { sourceName: searchRegex }
    ];
  }
  
  if (category && category !== 'all') {
    newsApiQuery.category = category;
  }

  // Filtrar por región en NewsAPI
  if (region === 'spanish') {
    newsApiQuery.$and = newsApiQuery.$and || [];
    newsApiQuery.$and.push({
      $or: [
        { sourceName: { $regex: 'marca|mundo|abc|pais|economista|20minutos|vanguardia|sport', $options: 'i' } },
        { url: { $regex: 'elpais\\.com|elmundo\\.es|abc\\.es|marca\\.com|eleconomista\\.es|20minutos\\.es|lavanguardia\\.com|sport\\.es', $options: 'i' } }
      ]
    });
  } else if (region === 'international') {
    newsApiQuery.$and = newsApiQuery.$and || [];
    newsApiQuery.$and.push({
      $or: [
        { sourceName: { $regex: 'bbc|cnn|reuters|nytimes|guardian|bloomberg|washington|associated', $options: 'i' } },
        { url: { $regex: 'bbc\\.com|cnn\\.com|reuters\\.com|nytimes\\.com|theguardian\\.com|bloomberg\\.com|washingtonpost\\.com|apnews\\.com', $options: 'i' } }
      ]
    });
  }
  
  // Buscar artículos de NewsAPI solamente
  const newsApiArticles = await Article.find(newsApiQuery)
    .sort({ publishedAt: -1 })
    .lean();

  const transformedNewsApiArticles = newsApiArticles.map((item: any) => ({
    ...item,
    source: 'newsapi',
    sourceName: item.sourceName || (typeof item.source === 'object' ? item.source?.name : null) || 'NewsAPI',
  }));

  // Paginar
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedArticles = transformedNewsApiArticles.slice(startIndex, endIndex);

  if (transformedNewsApiArticles.length > 0) {
    return {
      articles: paginatedArticles,
      totalResults: transformedNewsApiArticles.length,
      fromCache: true
    };
  }

  return null;
}

async function fetchFromAPI(query: string, category: string, page: number, pageSize: number, region: string = 'all') {
  let allFetchedArticles: any[] = [];
  const maxPages = 3; // Obtener hasta 3 páginas para tener más contenido
  
  // Si estamos obteniendo datos para llenar el caché, obtener múltiples páginas
  const shouldFetchMultiplePages = pageSize > 20;
  const pagesToFetch = shouldFetchMultiplePages ? maxPages : 1;
  
  for (let currentPage = 1; currentPage <= pagesToFetch; currentPage++) {
    const params: any = {
      apiKey: NEWS_API_KEY,
      q: query || undefined,
      page: shouldFetchMultiplePages ? currentPage : page,
      pageSize: Math.min(pageSize, 100), // NewsAPI max is 100
    };

    // Configurar parámetros según región y disponibilidad
    let apiUrl = NEWS_API_URL; // top-headlines por defecto

    if (query) {
      // Para búsquedas, usar everything API que tiene más resultados
      apiUrl = 'https://newsapi.org/v2/everything';
      params.sortBy = 'publishedAt';
        // Configurar según región
      if (region === 'spanish') {
        params.language = 'es';
        // Para búsquedas usar todo en español, no limitarse a fuentes específicas
        params.domains = 'elpais.com,elmundo.es,abc.es,marca.com,eleconomista.es,20minutos.es,lavanguardia.com';
      } else if (region === 'international') {
        params.language = 'en';
        params.sources = 'bbc-news,cnn,reuters,the-guardian,techcrunch,ars-technica,wired,engadget,the-verge';
      } else {
        params.language = 'en';
        params.sources = 'bbc-news,cnn,reuters,the-guardian,techcrunch,ars-technica,wired,engadget,the-verge';
      }    } else if (category) {      // Si hay categoría pero no query, usar la nueva lógica para fuentes españolas
      if (region === 'spanish') {
        // Para región española, usar la función optimizada que hace múltiples llamadas por dominio
        try {
          console.log(`Using newsService.getNewsByCategory for Spanish region, category: ${category}`);
          const newsServiceArticles = await getNewsByCategory(category, currentPage, 'spanish');
          
          if (newsServiceArticles.length === 0) {
            break;
          }
          
          // Convertir al formato esperado por la API
          const apiFormattedArticles = newsServiceArticles.map((article: any) => ({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            urlToImage: article.imageUrl,
            publishedAt: article.publishedAt,
            source: {
              id: article.dataSourceId,
              name: article.sourceName
            }
          }));
          
          allFetchedArticles.push(...apiFormattedArticles);
          console.log(`Added ${apiFormattedArticles.length} Spanish articles for category ${category}`);
          
          // No hacer la llamada a NewsAPI, saltamos directamente al final del bucle
          continue;
        } catch (error) {
          console.error('Error using newsService, falling back to direct API:', error);
          // Si falla, continuar con la lógica original
        }
      }
      
      // Lógica original para regiones no españolas o como fallback
      params.category = category;
      
      // Configurar según región
      if (region === 'spanish') {
        params.country = 'es';
        params.language = 'es';
      } else if (region === 'international') {
        params.country = 'us';
        params.language = 'en';
      } else {
        params.country = 'us';
        params.language = 'en';
      }
    } else {      // Si no hay query ni categoría, usar sources según región
      if (region === 'spanish') {
        // Para España usamos dominios ya que las fuentes oficiales de NewsAPI son limitadas
        apiUrl = 'https://newsapi.org/v2/everything';
        params.domains = 'elpais.com,elmundo.es,abc.es,marca.com,eleconomista.es,20minutos.es,lavanguardia.com';
        params.language = 'es';
        params.sortBy = 'publishedAt';
      } else {
        params.sources = 'bbc-news,cnn,reuters,the-guardian,techcrunch,ars-technica,wired';
        params.language = 'en';
      }
    }

    console.log(`Fetching from NewsAPI ${query ? 'everything' : 'top-headlines'} page ${currentPage} with params:`, params);
    
    try {
      const response = await axios.get(apiUrl, { params });
      console.log(`NewsAPI ${query ? 'everything' : 'top-headlines'} page ${currentPage} response status:`, response.data.status);
      console.log(`NewsAPI ${query ? 'everything' : 'top-headlines'} page ${currentPage} response totalResults:`, response.data.totalResults);
      
      const articles = response.data.articles || [];
      allFetchedArticles.push(...articles);
      
      // Si no hay más artículos, salir del bucle
      if (articles.length === 0) {
        break;
      }
    } catch (error) {
      console.error(`Error fetching page ${currentPage} from NewsAPI:`, error);
      break;
    }
  }
  // Transformar y guardar los artículos en MongoDB si hay artículos
  const transformedArticles = allFetchedArticles.map((article: any) => ({
    title: article.title,
    description: article.description || '',
    content: article.content || '',
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: new Date(article.publishedAt),    source: 'newsapi', // Identificar que viene de NewsAPI
    sourceName: article.source.name,
    sourceId: article.source.id,
    sourceUrl: article.source.url,
    category: category || 'general',
    language: region === 'spanish' ? 'es' : 'en' // Usar español para región española
  }));if (transformedArticles.length > 0) {
    await Article.insertMany(transformedArticles, {
      ordered: false // Ignorar duplicados basados en URL única
    }).catch(err => {
      // Ignorar errores de duplicados
      if (err.code !== 11000) throw err;
    });
  }

  return {
    articles: transformedArticles,
    totalResults: allFetchedArticles.length,
    fromCache: false
  };
}

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: 📰 Obtener noticias internacionales
 *     description: |
 *       Obtiene noticias desde NewsAPI con sistema de caché optimizado en MongoDB.
 *       
 *       **🚀 Características:**
 *       - 📦 **Caché inteligente**: Las noticias se almacenan en MongoDB por 15 minutos
 *       - 🌍 **Cobertura internacional**: Noticias de fuentes verificadas mundialmente
 *       - 🏷️ **Categorización**: Filtra por categorías específicas
 *       - 🔍 **Búsqueda avanzada**: Busca por términos específicos
 *       - ⚡ **Rendimiento optimizado**: Reduce llamadas a la API externa
 *       
 *       **💡 Casos de uso:**
 *       - Feed principal de noticias de la aplicación
 *       - Búsqueda de noticias sobre temas específicos
 *       - Exploración por categorías de interés
 *       - Actualización periódica de contenido
 *       
 *       **⏱️ Caché:**
 *       - Duración: 15 minutos
 *       - Uso: `refresh=true` para forzar actualización
 *       - Indicador: `fromCache` en la respuesta
 *     tags: [News]
 *     parameters:
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: category
 *         description: 🏷️ Categoría de noticias a filtrar
 *         schema:
 *           type: string
 *           enum: [business, entertainment, general, health, science, sports, technology]
 *           example: technology
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/PageSizeParam'
 *       - in: query
 *         name: refresh
 *         description: 🔄 Forzar actualización desde NewsAPI (omitir caché)
 *         schema:
 *           type: boolean
 *           default: false
 *           example: false
 *     responses:
 *       200:
 *         description: ✅ Noticias obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 totalResults:
 *                   type: integer
 *                   description: Total de noticias disponibles
 *                   example: 157
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Article'
 *                 fromCache:
 *                   type: boolean
 *                   description: Si los datos provienen del caché local
 *                   example: true
 *             examples:
 *               noticias_cached:
 *                 summary: Respuesta desde caché (rápida)
 *                 value:
 *                   status: "ok"
 *                   totalResults: 89
 *                   fromCache: true
 *                   articles:
 *                     - title: "Nueva innovación en IA revoluciona el mercado"
 *                       description: "Una startup desarrolla una tecnología..."
 *                       url: "https://techcrunch.com/example"
 *                       category: "technology"
 *                       publishedAt: "2025-06-13T08:30:00Z"
 *               noticias_fresh:
 *                 summary: Respuesta desde NewsAPI (actualizada)
 *                 value:
 *                   status: "ok"
 *                   totalResults: 234
 *                   fromCache: false
 *                   articles:
 *                     - title: "Últimas noticias de tecnología"
 *                       description: "Cobertura completa de..."
 *                       category: "technology"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function GET(request: Request) {
  try {
    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const region = searchParams.get('region') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const forceRefresh = searchParams.get('refresh') === 'true';

    // Para búsquedas específicas, obtener noticias relacionadas de NewsAPI
    if (query && !forceRefresh) {
      // Verificar si ya tenemos artículos de NewsAPI para esta búsqueda (búsqueda amplia)
      const isShortTerm = query.length <= 3;
      const searchRegex = isShortTerm 
        ? new RegExp(`\\b${query}\\b`, 'i') // Buscar palabra completa
        : new RegExp(query, 'i'); // Buscar substring
        
      const searchNewsApiCount = await Article.countDocuments({ 
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { content: searchRegex },
          { sourceName: searchRegex }
        ],
        source: 'newsapi' 
      });
      
      // Si tenemos pocos o ningún artículo de NewsAPI para esta búsqueda, obtener más
      if (searchNewsApiCount < 10) {        try {
          console.log(`Getting NewsAPI articles for search query: "${query}" (current: ${searchNewsApiCount})`);
          const newsApiResult = await fetchFromAPI(query, category, 1, 30, region);
          console.log(`Fetched ${newsApiResult.articles.length} new articles from NewsAPI for search: "${query}"`);
        } catch (apiError) {
          console.error('Error fetching from NewsAPI for search:', apiError);
        }
      }
    }

    // Para categorías específicas, siempre intentar obtener más datos de NewsAPI
    if (category && !forceRefresh && !query) {
      // Verificar si tenemos suficientes artículos de NewsAPI para esta categoría
      const newsApiCount = await Article.countDocuments({ 
        category, 
        source: 'newsapi' 
      });
        // Si tenemos menos de 40 artículos de NewsAPI para esta categoría, obtener más
      if (newsApiCount < 40) {
        try {
          console.log(`Getting more NewsAPI articles for category: ${category} (current: ${newsApiCount})`);
          const newsApiResult = await fetchFromAPI(query, category, 1, 40, region);
          console.log(`Fetched ${newsApiResult.articles.length} new articles from NewsAPI for ${category}`);
        } catch (apiError) {
          console.error('Error fetching from NewsAPI:', apiError);
        }
      }
    }

    // Si es una solicitud general sin categoría ni búsqueda y no tenemos muchos artículos, obtener más
    if (!category && !query && !forceRefresh) {      const generalNewsApiCount = await Article.countDocuments({ source: 'newsapi' });
      if (generalNewsApiCount < 60) {
        try {
          console.log(`Getting more general NewsAPI articles (current: ${generalNewsApiCount})`);
          const newsApiResult = await fetchFromAPI(query, category, 1, 30, region);
          console.log(`Fetched ${newsApiResult.articles.length} new general articles from NewsAPI`);
        } catch (apiError) {
          console.error('Error fetching from NewsAPI:', apiError);
        }
      }
    }    // Obtener datos del caché (ahora debería tener más artículos)
    let result = await fetchFromCache(query, category, page, pageSize, region);    // Si se fuerza refresh, obtener datos frescos de NewsAPI
    if (forceRefresh) {
      try {
        result = await fetchFromAPI(query, category, page, pageSize, region);
        console.log(`Fetched ${result.articles.length} new articles from NewsAPI (refresh)`);
      } catch (apiError) {
        console.error('Error fetching from NewsAPI, using cached data only:', apiError);
        result = await fetchFromCache(query, category, page, pageSize, region);
      }
    }

    // Si aún no hay resultado, devolver array vacío
    if (!result) {
      result = { articles: [], totalResults: 0, fromCache: true };
    }

    return NextResponse.json({
      status: "ok",
      totalResults: result.totalResults,
      articles: result.articles,
      fromCache: result.fromCache
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al obtener las noticias',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * @swagger
 * /api/news:
 *   post:
 *     summary: Marcar artículo como favorito
 *     description: Actualiza el estado de favorito de un artículo
 *     tags: [News]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - isFavorite
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL del artículo
 *               isFavorite:
 *                 type: boolean
 *                 description: Si el artículo debe estar marcado como favorito
 *     responses:
 *       200:
 *         description: Artículo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 article:
 *                   $ref: '#/components/schemas/Article'
 *       400:
 *         description: URL requerida
 *       404:
 *         description: Artículo no encontrado
 *       500:
 *         description: Error del servidor
 */
export async function POST(request: Request) {
  try {
    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();

    const body = await request.json();
    const { url, isFavorite } = body;

    if (!url) {
      return NextResponse.json(
        { status: "error", message: "URL es requerida" },
        { status: 400 }
      );
    }

    const article = await Article.findOneAndUpdate(
      { url },
      { $set: { isFavorite } },
      { new: true }
    );

    if (!article) {
      return NextResponse.json(
        { status: "error", message: "Artículo no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: "ok",
      article
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al actualizar el artículo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}