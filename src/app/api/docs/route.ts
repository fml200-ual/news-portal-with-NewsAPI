import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Obtiene la especificación OpenAPI de la API
 *     description: Retorna el documento JSON con toda la documentación de la API
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: Especificación OpenAPI
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET() {
  return Response.json(swaggerSpec);
}