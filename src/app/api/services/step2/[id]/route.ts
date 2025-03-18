// app/api/services/step2/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Service from '@/models/service.model';

export async function PUT(request: NextRequest) {
  try {
    await connectToDatabase();
    
    // Extract the id from the URL pathname
    const id = request.nextUrl.pathname.split('/').pop();
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Service ID not provided' }, { status: 400 });
    }

    const service = await Service.findByIdAndUpdate(
      id,
      { specifications: data.specifications },
      { new: true }
    );

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('Error updating service specifications:', error);
    return NextResponse.json({ error: 'Failed to update specifications' }, { status: 500 });
  }
}