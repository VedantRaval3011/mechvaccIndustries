// app/api/services/step1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Service from '@/models/service.model';
import connectDb from '@/lib/db';
import { uploadToCloudinary } from '@/lib/cloudinary';

// Helper function to convert File to base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const displayTitle = formData.get('displayTitle') as string;
    const group = formData.get('group') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const priceLabel = formData.get('priceLabel') as string;
    const description = formData.get('description') as string;
    const displayImage = formData.get('displayImage') as File | string;
    const additionalImages = formData.getAll('additionalImages') as (File | string)[];
    const video = formData.get('video') as string;
    const pdf = formData.get('pdf') as string;
    const seoKeywords = formData.get('seoKeywords') as string;

    if (!name || !displayTitle) {
      return NextResponse.json({ error: 'Name and displayTitle are required' }, { status: 400 });
    }

    // Handle display image upload
    let displayImageUrl = '';
    if (displayImage instanceof File) {
      const displayImageBase64 = await fileToBase64(displayImage);
      displayImageUrl = await uploadToCloudinary(displayImageBase64, 'services');
    } else if (typeof displayImage === 'string') {
      displayImageUrl = displayImage; // Keep existing URL if provided
    }

    // Handle additional images upload
    const additionalImageUrls = await Promise.all(
      additionalImages.map(async (item) => {
        if (item instanceof File) {
          const base64 = await fileToBase64(item);
          return await uploadToCloudinary(base64, 'services');
        }
        return item as string; // Keep existing URL if provided
      })
    );

    // Filter out any empty strings from failed uploads
    const validAdditionalImageUrls = additionalImageUrls.filter(url => url !== '');

    const service = new Service({
      name,
      displayTitle,
      group,
      price,
      priceLabel,
      description,
      displayImage: displayImageUrl || undefined,
      additionalImages: validAdditionalImageUrls.length > 0 ? validAdditionalImageUrls : [],
      video: video || undefined,
      pdf: pdf || undefined,
      seoKeywords: seoKeywords || undefined,
      specifications: [],
      queries: [],
    });

    const savedService = await service.save();
    return NextResponse.json({ id: savedService._id }, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}