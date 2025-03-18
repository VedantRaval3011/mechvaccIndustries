// app/api/products/step3/[id]/route.ts
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
      { queries: data.queries },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product queries:', error);
    return NextResponse.json(
      { error: 'Failed to update product queries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product.queries || []);
  } catch (error) {
    console.error('Error fetching product queries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product queries', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}