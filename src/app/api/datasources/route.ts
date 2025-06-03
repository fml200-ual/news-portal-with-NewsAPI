
import { NextResponse, type NextRequest } from 'next/server';
import { dataSourcesStore, getNextDataSourceId } from '@/lib/db';
import type { DataSource } from '@/types';
import { z } from 'zod';

// This schema might be less used now if we focus on a single pre-configured News API source
const dataSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.enum(['url', 'api']),
  value: z.string().min(1, "Value is required").url("Value must be a valid URL or API endpoint"),
});

export async function GET() {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    // Return the (likely single) configured data source, e.g., News API info
    return NextResponse.json(dataSourcesStore);
  } catch (error) {
    console.error("Failed to fetch data sources:", error);
    return NextResponse.json({ message: "Failed to fetch data sources" }, { status: 500 });
  }
}

// POST might be disabled or heavily restricted if sources are pre-configured
export async function POST(request: NextRequest) {
   // For a news portal focused on one API, adding new sources might be an admin function or disabled.
   // Returning 403 Forbidden as a placeholder.
  // return NextResponse.json({ message: "Adding new data sources is currently restricted." }, { status: 403 });

  // OR, if we still allow adding for some reason (e.g. admin wants to add another API source)
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
