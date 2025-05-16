// app/api/products/check-name/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Products from '@/models/products.model';

export async function GET(request: NextRequest) {
  try {
    // Extract the name query parameter
    const url = new URL(request.url);
    const name = url.searchParams.get('name');

    // Validate input
    if (!name) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Check if the product name already exists
    const existingProduct = await Products.findOne({ name: name });

    // Return the result
    return NextResponse.json(
      { exists: !!existingProduct },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking product name uniqueness:', error);
    return NextResponse.json(
      { error: 'Failed to check product name uniqueness' },
      { status: 500 }
    );
  }
}