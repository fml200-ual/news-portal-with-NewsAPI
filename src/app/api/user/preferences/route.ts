import { NextResponse } from 'next/server';
import { User } from '@/lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';

/**
 * @swagger
 * /api/user/preferences:
 *   get:
 *     summary: Obtener preferencias del usuario
 *     description: Obtiene las preferencias de configuración del usuario autenticado
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: Preferencias obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 preferences:
 *                   $ref: '#/components/schemas/UserPreferences'
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

/**
 * @swagger
 * /api/user/preferences:
 *   put:
 *     summary: Actualizar preferencias del usuario
 *     description: Actualiza las preferencias de configuración del usuario autenticado
 *     tags: [User]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Preferencias actualizadas correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 preferences:
 *                   $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         description: Solicitud incorrecta
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error del servidor
 */
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ status: "error", message: "No autorizado" }, { status: 401 });
    }

    // Connect to database with lazy loading
    const { connectToDatabase } = await import('@/lib/mongodb');
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
