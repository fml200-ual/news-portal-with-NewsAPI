import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

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

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

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
