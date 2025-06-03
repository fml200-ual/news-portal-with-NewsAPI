import { NextResponse, type NextRequest } from 'next/server';
import { dataSourcesStore, getNextDataSourceId } from '@/lib/db';
import type { DataSource } from '@/types';
import { z } from 'zod';

const dataSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['url', 'api']),
  value: z.string().min(1, "Value is required").url("Value must be a valid URL or API endpoint"), // Basic validation, can be improved
});

export async function GET() {
  try {
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    return NextResponse.json(dataSourcesStore);
  } catch (error) {
    console.error("Failed to fetch data sources:", error);
    return NextResponse.json({ message: "Failed to fetch data sources" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = dataSourceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: "Invalid input", errors: validation.error.format() }, { status: 400 });
    }
    
    const { name, type, value } = validation.data;

    const newDataSource: DataSource = {
      id: getNextDataSourceId(),
      name,
      type,
      value,
      status: 'idle',
      createdAt: new Date().toISOString(),
    };
    dataSourcesStore.push(newDataSource);
    return NextResponse.json(newDataSource, { status: 201 });
  } catch (error) {
    console.error("Failed to create data source:", error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ message: "Invalid JSON payload" }, { status: 400 });
    }
    return NextResponse.json({ message: "Failed to create data source" }, { status: 500 });
  }
}
