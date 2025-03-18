// app/api/services/step3/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Service from '@/models/service.model';
import dbConnect from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    
    // Extract the id from the URL pathname
    const id = request.nextUrl.pathname.split('/').pop();
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Service ID not provided' }, { status: 400 });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { queries: data.queries },
      { new: true }
    );

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service queries:', error);
    return NextResponse.json({ error: 'Failed to update queries' }, { status: 500 });
  }
}