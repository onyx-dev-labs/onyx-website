import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    systems: {
      database: 'connected',
      auth: 'active',
      storage: 'available'
    }
  });
}
