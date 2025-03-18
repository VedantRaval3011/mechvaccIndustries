// app/api/products/step2/[id]/route.ts
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const id = request.nextUrl.pathname.split('/').pop();
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { specifications: data.specifications },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product specifications:', error);
    return NextResponse.json(
      { error: 'Failed to update product specifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}