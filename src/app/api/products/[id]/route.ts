// app/api/products/[id]/route.ts
import { uploadToCloudinary } from '@/lib/cloudinary';
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const id = request.nextUrl.pathname.split('/').pop();
    const data = await request.formData();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

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

    // Log data for debugging
    console.log('Updating product with data:', {
      name: data.get('name'),
      displayTitle: data.get('displayTitle'),
      group: data.get('group'),
      price: data.get('price'),
      priceLabel: data.get('priceLabel'),
      description: data.get('description'),
      displayImage: displayImageUrl,
      additionalImages: additionalImageUrls,
      video: data.get('video'),
      pdf: data.get('pdf'),
      seoKeywords: data.get('seoKeywords'),
    });

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: data.get('name') as string,
        displayTitle: data.get('displayTitle') as string,
        group: data.get('group') as string,
        price: data.get('price') ? parseInt(data.get('price') as string, 10) : undefined,
        priceLabel: (data.get('priceLabel') as string) || '',
        description: (data.get('description') as string) || '',
        displayImage: displayImageUrl,
        additionalImages: additionalImageUrls,
        video: data.get('video') as string || undefined,
        pdf: data.get('pdf') as string || undefined,
        seoKeywords: data.get('seoKeywords') as string || undefined,
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    console.log('Updated product:', updatedProduct);
    return NextResponse.json(updatedProduct);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating product:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update product', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const id = request.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Product deleted successfully',
      id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting product:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete product', details: errorMessage },
      { status: 500 }
    );
  }
}