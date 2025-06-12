
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { DataSource } from '@/lib/models/DataSource';
import { z } from 'zod';

const dataSourceSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100, "El nombre es muy largo"),
  type: z.enum(['web', 'api', 'url'], { errorMap: () => ({ message: "El tipo debe ser 'web', 'api' o 'url'" }) }),
  url: z.string().min(1, "La URL es requerida").url("Debe ser una URL válida"),
  requiresJavaScript: z.boolean().optional().default(false),
  config: z.object({
    contentSelector: z.string().optional(),
    titleSelector: z.string().optional(),
    summarySelector: z.string().optional(),
    linkSelector: z.string().optional(),
    imageSelector: z.string().optional(),
    useFullUrl: z.boolean().optional(),
    maxItems: z.number().optional(),
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

export async function GET() {
  try {
    await connectToDatabase();
    const dataSources = await DataSource.find({}).sort({ createdAt: -1 });
    return NextResponse.json(dataSources);
  } catch (error) {
    console.error("Error al obtener fuentes de datos:", error);
    return NextResponse.json({ message: "Error al obtener fuentes de datos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const validation = dataSourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Datos de entrada inválidos", 
        errors: validation.error.format() 
      }, { status: 400 });
    }
    
    const validatedData = validation.data;    // Verificar si ya existe una fuente con la misma URL
    const existingSource = await DataSource.findOne({ url: validatedData.url });
    if (existingSource) {
      return NextResponse.json({ 
        message: "Ya existe una fuente de datos con esta URL" 
      }, { status: 409 });
    }

    const newDataSource = new DataSource({
      name: validatedData.name,
      type: validatedData.type,
      url: validatedData.url,
      requiresJavaScript: validatedData.requiresJavaScript || false,
      config: validatedData.config,
      status: 'idle',
      createdAt: new Date().toISOString()
    });

    await newDataSource.save();

    return NextResponse.json({
      message: "Fuente de datos creada exitosamente",
      dataSource: newDataSource
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error al crear fuente de datos:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }
    return NextResponse.json({ 
      message: "Error al crear fuente de datos",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
