
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ScrapedItem } from '@/lib/models/ScrapedItem';
import { z } from 'zod';

// Schema for updating parts of a scraped article
const scrapedItemUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  category: z.enum(['technology', 'business', 'sports', 'science', 'health', 'entertainment', 'general']).optional(),
  isEnriched: z.boolean().optional(),
  sentiment: z.enum(['positive', 'negative', 'neutral']).optional().nullable(),
  summary: z.string().optional().nullable(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params before using its properties
  const { id } = await params;
  
  try {
    await connectToDatabase();
    
    const item = await ScrapedItem.findById(id);
    if (!item) {
      return NextResponse.json({ message: "Artículo no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: item._id.toString(),
      dataSourceId: item.dataSourceId,
      dataSourceName: item.dataSourceName,
      title: item.title,
      description: item.description,
      url: item.url,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      content: item.content,
      category: item.category,
      sourceName: item.sourceName,
      isEnriched: item.isEnriched,
      sentiment: item.sentiment,
      summary: item.summary,
      createdAt: item.createdAt,
      lastUpdatedAt: item.lastUpdatedAt
    });
      } catch (error: any) {
    console.error(`Error al obtener artículo ${id}:`, error);
    return NextResponse.json({ 
      message: "Error al obtener artículo",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params before using its properties
  const { id } = await params;
  
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const validation = scrapedItemUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        message: "Datos de entrada inválidos", 
        errors: validation.error.format() 
      }, { status: 400 });
    }    const updatedItem = await ScrapedItem.findByIdAndUpdate(
      id,
      {
        ...validation.data,
        lastUpdatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ message: "Artículo no encontrado" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: updatedItem._id.toString(),
      dataSourceId: updatedItem.dataSourceId,
      dataSourceName: updatedItem.dataSourceName,
      title: updatedItem.title,
      description: updatedItem.description,
      url: updatedItem.url,
      imageUrl: updatedItem.imageUrl,
      publishedAt: updatedItem.publishedAt,
      content: updatedItem.content,
      category: updatedItem.category,
      sourceName: updatedItem.sourceName,
      isEnriched: updatedItem.isEnriched,
      sentiment: updatedItem.sentiment,
      summary: updatedItem.summary,
      createdAt: updatedItem.createdAt,
      lastUpdatedAt: updatedItem.lastUpdatedAt
    });
      } catch (error: any) {
    console.error(`Error al actualizar artículo ${id}:`, error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
    }
    return NextResponse.json({ 
      message: "Error al actualizar artículo",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params before using its properties
  const { id } = await params;
  
  try {
    await connectToDatabase();
    
    const deletedItem = await ScrapedItem.findByIdAndDelete(id);
    
    if (!deletedItem) {
      return NextResponse.json({ message: "Artículo no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Artículo eliminado correctamente",
      id: deletedItem._id.toString()
    }, { status: 200 });
      } catch (error: any) {
    console.error(`Error al eliminar artículo ${id}:`, error);
    return NextResponse.json({ 
      message: "Error al eliminar artículo",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
