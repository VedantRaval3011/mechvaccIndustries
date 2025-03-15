// app/api/products/[id]/route.ts
import { uploadToCloudinary } from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  
  try {
    // Await the params Promise to get the id
    const { id } = await params;
    
    // Check if the ID is a valid MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    // Await the params Promise
    const { id } = await params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
    }

    const data = await request.formData();
 
    const toBase64 = async (file: File): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${file.type};base64,${buffer.toString('base64')}`;
    };

    let displayImageUrl = data.get('displayImage') as string;
    if (data.get('displayImage') instanceof File) {
      const displayImageBase64 = await toBase64(data.get('displayImage') as File);
      displayImageUrl = await uploadToCloudinary(displayImageBase64, 'products/display');
    }

    const additionalImagesFiles = data.getAll('additionalImages');
    const additionalImageUrls = await Promise.all(
      additionalImagesFiles.map(async (item) => {
        if (item instanceof File) {
          const base64 = await toBase64(item);
          return await uploadToCloudinary(base64, 'products/additional');
        }
        return item as string;
      })
    );

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: data.get('name'),
        displayTitle: data.get('displayTitle'),
        group: data.get('group'),
        price: parseInt(data.get('price') as string, 10),
        displayImage: displayImageUrl,
        additionalImages: additionalImageUrls,
        video: data.get('video'),
        pdf: data.get('pdf'),
        seoKeywords: data.get('seoKeywords'),
      },
      { 
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update product', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    
    // Await the params Promise
    const { id } = await params;

    // Check if the ID is a valid MongoDB ObjectId
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Product deleted successfully',
      id: id 
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to delete product', details: errorMessage },
      { status: 500 }
    );
  }
}