
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ScrapedItem } from '@/lib/models/ScrapedItem';
import { DataSource } from '@/lib/models/DataSource';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Construir filtro
    const filter: any = {};
    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
    }

    // Obtener artículos con paginación
    const scrapedItems = await ScrapedItem.find(filter)
      .sort({ publishedAt: -1, scrapedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('dataSourceId', 'name')
      .lean();

    // Contar total para paginación
    const total = await ScrapedItem.countDocuments(filter);    // Transformar datos para mantener compatibilidad con el frontend
    const articles = scrapedItems.map((item: any) => ({
      id: item._id.toString(),
      dataSourceId: item.dataSourceId,
      dataSourceName: item.dataSourceName,
      title: item.title,
      description: item.description,
      url: item.url,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      content: item.content,
      category: item.category,
      sourceName: item.sourceName,
      isEnriched: item.isEnriched,
      sentiment: item.sentiment,
      summary: item.summary,
      createdAt: item.createdAt,
      lastUpdatedAt: item.lastUpdatedAt
    }));

    return NextResponse.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });

  } catch (error: any) {
    console.error("Error al obtener artículos scrapeados:", error);
    return NextResponse.json({ 
      message: "Error al obtener artículos scrapeados",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
