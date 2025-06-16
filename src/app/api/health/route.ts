import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Estado y salud del sistema
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Verificar estado del sistema
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Sistema funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     application:
 *                       type: string
 *                       example: "running"
 *       503:
 *         description: Error en el sistema (base de datos desconectada)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "disconnected"
 *                     application:
 *                       type: string
 *                       example: "running"
 *                 error:
 *                   type: string
 *                   example: "Database connection failed"
 */

export async function GET() {
  try {
    // Check database connection
    await connectToDatabase();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        application: 'running'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        application: 'running'
      },
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Database connection failed'
    }, { status: 503 });
  }
}
