import { NextResponse, type NextRequest } from 'next/server';
import { DataSource } from '@/lib/models/DataSource';
import { ScrapedItem } from '@/lib/models/ScrapedItem';
import { WebScraper, scrapingConfigs, createGenericConfig } from '@/services/scrapingService';
import type { NewsArticle } from '@/types';

/**
 * @swagger
 * /api/datasources/{id}/scrape:
 *   post:
 *     summary: Ejecutar scraping en una fuente de datos específica
 *     tags: [DataSources, Scraping]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la fuente de datos
 *     responses:
 *       200:
 *         description: Scraping ejecutado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Scraping completado. 15 artículos extraídos."
 *                 itemsScraped:
 *                   type: number
 *                   example: 15
 *                 method:
 *                   type: string
 *                   enum: [predefined, generic]
 *                   example: "predefined"
 *                 articles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScrapedItem'
 *       404:
 *         description: Fuente de datos no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Fuente de datos no encontrada"
 *       500:
 *         description: Error durante el scraping
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error durante el scraping"
 *                 details:
 *                   type: string
 *                   example: "Timeout al conectar con el sitio web"
 */

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before using its properties
    const { id } = await params;
    
    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
    
    const dataSource = await DataSource.findById(id);
    if (!dataSource) {
      return NextResponse.json(
        { error: 'Fuente de datos no encontrada' },
        { status: 404 }
      );
    }

    // Actualizar estado a "scraping"
    dataSource.status = 'scraping';
    dataSource.errorMessage = undefined;
    await dataSource.save();

    let articles: NewsArticle[] = [];
    let scrapingMethod = 'generic';

    try {
      // Determinar el método de scraping
      const hostname = new URL(dataSource.url).hostname;
      const config = scrapingConfigs[hostname];

      if (config) {
        // Usar scraper con configuración predefinida
        scrapingMethod = 'predefined';
        const scraper = new WebScraper(config);
        articles = await scraper.scrapeArticles();
      } else {
        // Usar scraper genérico con configuración personalizada o genérica
        scrapingMethod = 'generic';
        const genericConfig = dataSource.config?.selectors 
          ? {
              url: dataSource.url,
              selectors: dataSource.config.selectors,
              baseUrl: new URL(dataSource.url).origin
            }
          : createGenericConfig(dataSource.url);
        
        const scraper = new WebScraper(genericConfig);
        articles = await scraper.scrapeArticles();
      }

      // Filtrar artículos duplicados por URL
      const existingUrls = new Set();
      const existingItems = await ScrapedItem.find({ dataSourceId: dataSource._id }).select('url');
      existingItems.forEach(item => existingUrls.add(item.url));

      const newArticles = articles.filter(article => !existingUrls.has(article.url));

      // Guardar artículos en la base de datos
      const savedItems = [];
      for (const article of newArticles.slice(0, 20)) { // Limitar a 20 artículos
        try {
          const scrapedItem = new ScrapedItem({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            imageUrl: article.imageUrl,
            publishedAt: article.publishedAt,
            category: article.category,
            sourceName: article.sourceName,
            dataSourceId: dataSource._id,
            dataSourceName: dataSource.name,
            isEnriched: false,
            originalUrl: article.url,
            scrapedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString()
          });
          
          await scrapedItem.save();
          savedItems.push(scrapedItem);
        } catch (error: any) {
          console.warn('Error guardando artículo:', error.message);
        }
      }

      // Actualizar la fuente de datos
      dataSource.status = 'success';
      dataSource.lastScrapedAt = new Date().toISOString();
      dataSource.totalItems = (dataSource.totalItems || 0) + savedItems.length;
      await dataSource.save();

      return NextResponse.json({
        success: true,
        message: `Scraping completado con método ${scrapingMethod}. ${savedItems.length} artículos nuevos extraídos de ${articles.length} encontrados.`,
        itemsScraped: savedItems.length,
        totalFound: articles.length,
        method: scrapingMethod,
        articles: savedItems.map(item => ({
          id: item._id,
          title: item.title,
          description: item.description,
          url: item.url,
          imageUrl: item.imageUrl,
          publishedAt: item.publishedAt,
          category: item.category,
          sourceName: item.sourceName
        }))
      });

    } catch (scrapingError: any) {
      console.error('Error durante el scraping:', scrapingError);
      
      // Actualizar estado de error
      dataSource.status = 'error';
      dataSource.errorMessage = scrapingError.message || 'Error desconocido durante el scraping';
      await dataSource.save();

      return NextResponse.json(
        { 
          error: 'Error durante el scraping',
          details: scrapingError.message,
          method: scrapingMethod
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error general en scraping:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
