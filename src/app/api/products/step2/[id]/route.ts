// app/api/products/step2/[id]/route.ts
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();
  const data = await request.json();
  
  const product = await Product.findByIdAndUpdate(
    params.id,
    { specifications: data.specifications },
    { new: true }
  );
  
  return NextResponse.json(product);
}