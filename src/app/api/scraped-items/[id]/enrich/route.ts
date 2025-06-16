import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ScrapedItem } from '@/lib/models/ScrapedItem';

// Servicio de enriquecimiento básico
class EnrichmentService {
  static analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    if (!text) return 'neutral';
    
    const positiveWords = ['bueno', 'excelente', 'positivo', 'éxito', 'ganar', 'logro', 'victoria', 'alegría'];
    const negativeWords = ['malo', 'terrible', 'negativo', 'fracaso', 'perder', 'problema', 'crisis', 'error'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
      if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  static generateSummary(title: string, content: string | null, description: string | null): string {
    const text = content || description || title;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    if (sentences.length <= 2) {
      return text.substring(0, 200) + (text.length > 200 ? '...' : '');
    }
    
    // Tomar las primeras 2 oraciones más relevantes
    const summary = sentences.slice(0, 2).join('. ') + '.';
    return summary.length > 300 ? summary.substring(0, 297) + '...' : summary;
  }
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params before using its properties
  const { id } = await params;
  
  try {
    await connectToDatabase();
    
    const item = await ScrapedItem.findById(id);
    if (!item) {
      return NextResponse.json({ message: "Artículo no encontrado" }, { status: 404 });
    }

    if (item.isEnriched) {
      return NextResponse.json({ 
        message: "El artículo ya está enriquecido",
        item: {
          id: item._id.toString(),
          title: item.title,
          sentiment: item.sentiment,
          summary: item.summary,
          isEnriched: item.isEnriched
        }
      }, { status: 200 });
    }

    // Simular un pequeño delay para el procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generar enriquecimiento
    const sentiment = EnrichmentService.analyzeSentiment(
      [item.title, item.description, item.content].filter(Boolean).join(' ')
    );
    
    const summary = EnrichmentService.generateSummary(
      item.title, 
      item.content, 
      item.description
    );    // Actualizar el artículo en la base de datos
    const updatedItem = await ScrapedItem.findByIdAndUpdate(
      id,
      {
        isEnriched: true,
        sentiment,
        summary,
        lastUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ 
      message: `Artículo enriquecido exitosamente`,
      item: {
        id: updatedItem!._id.toString(),
        title: updatedItem!.title,
        sentiment: updatedItem!.sentiment,
        summary: updatedItem!.summary,
        isEnriched: updatedItem!.isEnriched,
        lastUpdatedAt: updatedItem!.lastUpdatedAt
      }
    }, { status: 200 });
      } catch (error: any) {
    console.error(`Error al enriquecer artículo ${id}:`, error);
    return NextResponse.json({ 
      message: "Error al enriquecer artículo",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/scraped-items/{id}/enrich:
 *   post:
 *     summary: Enriquecer artículo con análisis de sentimiento y resumen
 *     tags: [ScrapedItems, AI]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del artículo scrapeado
 *     responses:
 *       200:
 *         description: Artículo enriquecido exitosamente
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
 *                   example: "Artículo enriquecido exitosamente"
 *                 item:
 *                   allOf:
 *                     - $ref: '#/components/schemas/ScrapedItem'
 *                     - type: object
 *                       properties:
 *                         isEnriched:
 *                           type: boolean
 *                           example: true
 *                         sentiment:
 *                           type: string
 *                           enum: [positive, negative, neutral]
 *                           example: "positive"
 *                         summary:
 *                           type: string
 *                           example: "Resumen generado automáticamente del contenido del artículo..."
 *       404:
 *         description: Artículo no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Artículo no encontrado"
 *       409:
 *         description: Artículo ya enriquecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Este artículo ya ha sido enriquecido"
 *       500:
 *         description: Error durante el enriquecimiento
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error al enriquecer artículo"
 *                 details:
 *                   type: string
 */
