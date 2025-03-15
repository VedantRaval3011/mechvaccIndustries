// app/api/products/route.ts (New GET API)
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  const products = await Product.find({});
  return NextResponse.json(products);
}