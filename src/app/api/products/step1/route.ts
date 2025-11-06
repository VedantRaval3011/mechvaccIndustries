// app/api/products/step1/route.ts
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.formData();

    const name = data.get('name') as string;
    const displayTitle = data.get('displayTitle') as string;
    const displayImage = data.get('displayImage') as File;
    const additionalImages = data.getAll('additionalImages') as File[];
    const customSections = data.get("customSections")
         ? JSON.parse(data.get("customSections") as string)
         : [];

    if (!name || !displayTitle || !displayImage) {
      return NextResponse.json({ error: 'Name, displayTitle, and displayImage are required' }, { status: 400 });
    }

    // Convert File to base64
    const toBase64 = async (file: File): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${file.type};base64,${buffer.toString('base64')}`;
    };

    // Upload display image to Cloudinary
    const displayImageBase64 = await toBase64(displayImage);
    const displayImageUrl = await uploadToCloudinary(displayImageBase64, 'products/display');

    // Upload additional images to Cloudinary
    const additionalImageUrls = await Promise.all(
      additionalImages.map(async (file) => {
        const base64 = await toBase64(file);
        return await uploadToCloudinary(base64, 'products/additional');
      })
    );

    const product = new Product({
      name,
      displayTitle,
      group: data.get('group') as string,
      price: data.get('price') ? Number(data.get('price')) : undefined,
      displayImage: displayImageUrl,
      additionalImages: additionalImageUrls,
      video: data.get('video') as string || undefined,
      pdf: data.get('pdf') as string || undefined,
      seoKeywords: data.get('seoKeywords') as string || undefined,
      priceLabel: data.get('priceLabel') as string,
      description: data.get('description') as string,
      applications: data.get('applications') as string || undefined,
      customSections,
    });

    await product.save();
    return NextResponse.json({ id: product._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}