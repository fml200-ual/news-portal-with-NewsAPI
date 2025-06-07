import { NextResponse } from 'next/server';
import axios from 'axios';
import { connectToDatabase } from '@/lib/mongodb';
import { Article } from '@/lib/models/Article';

const NEWS_API_KEY = process.env.NEWSAPI_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/top-headlines';
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos en milisegundos

async function fetchFromCache(query: string, category: string, page: number, pageSize: number) {
  const cacheTime = new Date(Date.now() - CACHE_DURATION);
  
  const articles = await Article.find({
    ...(query && { title: new RegExp(query, 'i') }),
    ...(category && { category }),
    createdAt: { $gte: cacheTime }
  })
    .sort({ publishedAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

  if (articles.length > 0) {
    const total = await Article.countDocuments({
      ...(query && { title: new RegExp(query, 'i') }),
      ...(category && { category }),
      createdAt: { $gte: cacheTime }
    });

    return {
      articles,
      totalResults: total,
      fromCache: true
    };
  }

  return null;
}

async function fetchFromAPI(query: string, category: string, page: number, pageSize: number) {
  const params = {
    apiKey: NEWS_API_KEY,
    country: 'es',
    q: query,
    category: category || undefined,
    page,
    pageSize,
  };

  const response = await axios.get(NEWS_API_URL, { params });
  const articles = response.data.articles;

  // Transformar y guardar los artículos en MongoDB
  const transformedArticles = articles.map((article: any) => ({
    title: article.title,
    description: article.description || '',
    content: article.content || '',
    url: article.url,
    imageUrl: article.urlToImage,
    publishedAt: new Date(article.publishedAt),
    source: {
      name: article.source.name,
      id: article.source.id,
      url: article.source.url
    },
    category: category || 'general',
    language: 'es'
  }));

  await Article.insertMany(transformedArticles, {
    ordered: false // Ignorar duplicados basados en URL única
  }).catch(err => {
    // Ignorar errores de duplicados
    if (err.code !== 11000) throw err;
  });

  return {
    articles: transformedArticles,
    totalResults: response.data.totalResults,
    fromCache: false
  };
}

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const forceRefresh = searchParams.get('refresh') === 'true';

    let result;

    if (!forceRefresh) {
      result = await fetchFromCache(query, category, page, pageSize);
    }

    if (!result) {
      result = await fetchFromAPI(query, category, page, pageSize);
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

// Ruta para marcar artículos como favoritos
export async function POST(request: Request) {
  try {
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