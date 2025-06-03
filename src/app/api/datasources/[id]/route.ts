import { NextResponse, type NextRequest } from 'next/server';
import { dataSourcesStore } from '@/lib/db';
import type { DataSource } from '@/types';
import { z } from 'zod';

const dataSourceUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  type: z.enum(['url', 'api']).optional(),
  value: z.string().min(1, "Value is required").url("Value must be a valid URL or API endpoint").optional(),
  status: z.enum(['idle', 'scraping', 'error', 'success']).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataSource = dataSourcesStore.find(ds => ds.id === params.id);
    if (!dataSource) {
      return NextResponse.json({ message: "Data source not found" }, { status: 404 });
    }
    return NextResponse.json(dataSource);
  } catch (error) {
    console.error(`Failed to fetch data source ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch data source" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const validation = dataSourceUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.format() }, { status: 400 });
    }

    const dataSourceIndex = dataSourcesStore.findIndex(ds => ds.id === params.id);
    if (dataSourceIndex === -1) {
      return NextResponse.json({ message: "Data source not found" }, { status: 404 });
    }

    const updatedDataSource = { ...dataSourcesStore[dataSourceIndex], ...validation.data, lastScrapedAt: validation.data.status ? new Date().toISOString() : dataSourcesStore[dataSourceIndex].lastScrapedAt };
    dataSourcesStore[dataSourceIndex] = updatedDataSource;
    
    return NextResponse.json(updatedDataSource);
  } catch (error) {
    console.error(`Failed to update data source ${params.id}:`, error);
     if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to update data source" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dataSourceIndex = dataSourcesStore.findIndex(ds => ds.id === params.id);
    if (dataSourceIndex === -1) {
      return NextResponse.json({ message: "Data source not found" }, { status: 404 });
    }

    dataSourcesStore.splice(dataSourceIndex, 1);
    return NextResponse.json({ message: "Data source deleted" }, { status: 200 });
  } catch (error) {
    console.error(`Failed to delete data source ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete data source" }, { status: 500 });
  }
}
