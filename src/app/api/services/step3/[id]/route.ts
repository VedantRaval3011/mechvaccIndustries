// app/api/services/step3/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Service from '@/models/service.model';
import dbConnect from '@/lib/db';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const data = await request.json();

    const service = await Service.findByIdAndUpdate(
      params.id,
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