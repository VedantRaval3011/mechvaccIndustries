// app/api/products/step1/route.ts
import dbConnect from '@/lib/db';
import Product from '@/models/products.model';
import { NextResponse } from 'next/server';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(request: Request) {
  await dbConnect();

  const data = await request.formData();
  const displayImage = data.get('displayImage') as File;
  const additionalImages = data.getAll('additionalImages') as File[];

  // Convert File to base64 using Buffer (Node.js compatible)
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
    name: data.get('name'),
    displayTitle: data.get('displayTitle'),
    group: data.get('group'),
    price: Number(data.get('price')),
    displayImage: displayImageUrl,
    additionalImages: additionalImageUrls,
    video: data.get('video'),
    pdf: data.get('pdf'),
    seoKeywords: data.get('seoKeywords'),
  });

  await product.save();
  return NextResponse.json({ id: product._id });
}