import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DataSource } from '@/lib/models/DataSource';
import { ScrapedItem } from '@/lib/models/ScrapedItem';
import { z } from 'zod';

const dataSourceUpdateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").optional(),
  requiresJavaScript: z.boolean().optional(),
  scrapingConfig: z.object({
    selectors: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      content: z.string().optional(),
      image: z.string().optional(),
      publishedAt: z.string().optional(),
      link: z.string().optional(),
      container: z.string().optional()
    }).optional()
  }).optional()
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before using its properties
    const { id } = await params;
    
    await connectToDatabase();
    
    const dataSource = await DataSource.findById(id);
    if (!dataSource) {
      return NextResponse.json(
        { error: 'Fuente de datos no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(dataSource);  } catch (error: any) {
    console.error('Error al obtener fuente de datos:', error);
    return NextResponse.json(
      { 
        error: 'Error al obtener fuente de datos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before using its properties
    const { id } = await params;
    
    await connectToDatabase();
    
    const dataSource = await DataSource.findById(id);
    if (!dataSource) {
      return NextResponse.json(
        { error: 'Fuente de datos no encontrada' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validation = dataSourceUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Datos de entrada inválidos", 
        errors: validation.error.format() 
      }, { status: 400 });
    }
    
    // Actualizar campos permitidos
    const validatedData = validation.data;
    if (validatedData.name) dataSource.name = validatedData.name;
    if (validatedData.requiresJavaScript !== undefined) dataSource.requiresJavaScript = validatedData.requiresJavaScript;
    if (validatedData.scrapingConfig) dataSource.scrapingConfig = validatedData.scrapingConfig;

    await dataSource.save();

    return NextResponse.json({
      message: 'Fuente de datos actualizada exitosamente',
      dataSource
    });

  } catch (error: any) {
    console.error('Error al actualizar fuente de datos:', error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }
    return NextResponse.json({ 
      message: "Error al actualizar fuente de datos",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params before using its properties
    const { id } = await params;
    
    await connectToDatabase();
    
    const dataSource = await DataSource.findById(id);
    if (!dataSource) {
      return NextResponse.json(
        { error: 'Fuente de datos no encontrada' },
        { status: 404 }
      );
    }    // Eliminar todos los artículos scrapeados de esta fuente
    await ScrapedItem.deleteMany({ dataSourceId: id });

    // Eliminar la fuente de datos
    await DataSource.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Fuente de datos y artículos asociados eliminados exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar fuente de datos:', error);
    return NextResponse.json(
      { 
        error: 'Error al eliminar fuente de datos',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
