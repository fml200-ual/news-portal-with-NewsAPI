import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ScrapedItem } from '@/lib/models/ScrapedItem';
import { DataSource } from '@/lib/models/DataSource';

/**
 * @swagger
 * tags:
 *   name: ScrapedItems
 *   description: Gestión de artículos extraídos mediante scraping
 */

/**
 * @swagger
 * /api/scraped-items:
 *   get:
 *     summary: Obtener artículos scrapeados
 *     tags: [ScrapedItems]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de artículos por página
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (ej. technology, business, sports)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar en título y descripción
 *     responses:
 *       200:
 *         description: Lista de artículos scrapeados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 articles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "64f5b2c1a123456789abcdef"
 *                       title:
 *                         type: string
 *                         example: "Nueva tecnología revoluciona el mercado"
 *                       description:
 *                         type: string
 *                         example: "Una breve descripción del artículo..."
 *                       url:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/articulo"
 *                       imageUrl:
 *                         type: string
 *                         format: uri
 *                         example: "https://example.com/imagen.jpg"
 *                       sourceName:
 *                         type: string
 *                         example: "El País"
 *                       category:
 *                         type: string
 *                         example: "technology"
 *                       publishedAt:
 *                         type: string
 *                         format: date-time
 *                       isEnriched:
 *                         type: boolean
 *                         example: false
 *                       sentiment:
 *                         type: string
 *                         enum: [positive, negative, neutral]
 *                         example: "neutral"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     totalPages:
 *                       type: integer
 *                       example: 8
 *                     hasMore:
 *                       type: boolean
 *                       example: true
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

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
