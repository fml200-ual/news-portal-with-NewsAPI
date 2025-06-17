import { NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';

/**
 * @swagger
 * /api/news/favorites:
 *   get:
 *     summary: Obtener artículos favoritos
 *     description: Obtiene los artículos favoritos del usuario autenticado o verifica si un artículo específico está en favoritos
 *     tags: [News, Favorites]
 *     security:
 *       - sessionAuth: []
 *     parameters:
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: string
 *         description: ID del artículo para verificar si está en favoritos
 *     responses:
 *       200:
 *         description: Favoritos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     isFavorite:
 *                       type: boolean
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: ok
 *                     articles:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Article'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
    const user = await User.findById(session.user.id);

    // Verificar si estamos consultando el estado de un artículo específico
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (articleId) {
      // Devolver si el artículo está en favoritos
      const isFavorite = user.favorites.some((fav: { id: string }) => fav.id === articleId);
      return NextResponse.json({ status: "ok", isFavorite });
    }

    // Si no hay articleId, devolver todos los favoritos
    return NextResponse.json({
      status: "ok",
      articles: user.favorites || []
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al obtener artículos favoritos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/news/favorites:
 *   post:
 *     summary: Añadir artículo a favoritos
 *     description: Añade un artículo a la lista de favoritos del usuario autenticado
 *     tags: [News, Favorites]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - article
 *             properties:
 *               article:
 *                 $ref: '#/components/schemas/Article'
 *     responses:
 *       200:
 *         description: Artículo añadido a favoritos exitosamente
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
 *       400:
 *         description: Artículo requerido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
    const { article } = await request.json();

    if (!article || !article.id) {
      return NextResponse.json(
        { status: "error", message: "Artículo requerido" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user.favorites.some((fav: { id: string }) => fav.id === article.id)) {
      user.favorites.push(article);
      await user.save();
    }

    return NextResponse.json({
      status: "ok",
      message: "Artículo añadido a favoritos"
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al añadir artículo a favoritos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/news/favorites:
 *   delete:
 *     summary: Eliminar artículo de favoritos
 *     description: Elimina un artículo de la lista de favoritos del usuario autenticado
 *     tags: [News, Favorites]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - articleId
 *             properties:
 *               articleId:
 *                 type: string
 *                 description: ID del artículo a eliminar de favoritos
 *     responses:
 *       200:
 *         description: Artículo eliminado de favoritos exitosamente
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
 *       400:
 *         description: ID del artículo requerido
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
    const { articleId } = await request.json();

    if (!articleId) {
      return NextResponse.json(
        { status: "error", message: "ID del artículo requerido" },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);
    if (!user || !Array.isArray(user.favorites)) {
      return NextResponse.json(
        { status: "error", message: "Usuario no encontrado o favoritos no definidos" },
        { status: 404 }
      );
    }
    user.favorites = user.favorites.filter((fav: { id: string }) => fav.id !== articleId);
    await user.save();

    return NextResponse.json({
      status: "ok",
      message: "Artículo eliminado de favoritos"
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al eliminar artículo de favoritos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
