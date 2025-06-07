import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();

    return NextResponse.json(
      { message: 'Usuario registrado correctamente' },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        message: 'Error al registrar usuario',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
