import { NextResponse } from 'next/server';
import { Article } from '@/lib/models/Article';

/**
 * @swagger
 * /api/news/clear-cache:
 *   delete:
 *     summary: 🗑️ Limpiar caché de noticias
 *     description: Elimina artículos de NewsAPI antiguos para forzar actualización
 *     tags: [News]
 *     responses:
 *       200:
 *         description: ✅ Caché limpiado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Cache cleared successfully
 *                 deletedCount:
 *                   type: integer
 *                   example: 125
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
export async function DELETE() {
  try {
    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();

    // Eliminar todos los artículos de NewsAPI para forzar refresh
    const result = await Article.deleteMany({ 
      source: 'newsapi'
    });

    return NextResponse.json({
      status: "ok",
      message: "Cache cleared successfully",
      deletedCount: result.deletedCount
    });

  } catch (error: any) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al limpiar la caché',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
