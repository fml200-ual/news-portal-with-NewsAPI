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
    
    return NextResponse.json({
      status: "ok",
      preferences: user.preferences || {
        excludedSources: [],
        displayName: user.name,
        bio: '',
        emailNotifications: true,
        theme: 'system'
      }
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al obtener preferencias',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

    await connectToDatabase();
    const { preferences } = await request.json();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar preferencias manteniendo valores existentes que no se están actualizando
    user.preferences = {
      ...user.preferences || {},
      ...preferences
    };
    await user.save();

    return NextResponse.json({
      status: "ok",
      message: "Preferencias actualizadas correctamente",
      preferences: user.preferences
    });

  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        status: "error",
        message: 'Error al actualizar preferencias',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
