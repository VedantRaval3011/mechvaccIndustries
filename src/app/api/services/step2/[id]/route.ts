// app/api/services/step2/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  connectToDatabase  from '@/lib/db';
import Service from '@/models/service.model';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await request.json();

    const service = await Service.findByIdAndUpdate(
      params.id,
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