import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    // Check database connection
    await connectToDatabase();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        application: 'running'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
        application: 'running'
      },
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : 'Database connection failed'
    }, { status: 503 });
  }
}
