// app/api/products/step3/[id]/route.ts
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await request.json();
  
  const product = await Product.findByIdAndUpdate(
    params.id,
    { queries: data.queries },
    { new: true }
  );
  
  return NextResponse.json(product);
}