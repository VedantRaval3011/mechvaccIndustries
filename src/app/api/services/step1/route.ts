// app/api/services/step1/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Service from '@/models/service.model'; 
import connectDb from '@/lib/db'; // Assuming you have a DB connection utility

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const formData = await req.formData();
    const name = formData.get('name') as string;
    const displayTitle = formData.get('displayTitle') as string;
    const group = formData.get('group') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const displayImage = formData.get('displayImage') as File;
    const additionalImages = formData.getAll('additionalImages') as File[];
    const video = formData.get('video') as string;
    const pdf = formData.get('pdf') as string;
    const seoKeywords = formData.get('seoKeywords') as string;

    // Here you would typically upload files to a storage service (e.g., S3, Cloudinary)
    // For simplicity, we'll assume the file paths are stored as strings
    const displayImagePath = `/uploads/services/${displayImage.name}`; // Replace with actual upload logic
    const additionalImagePaths = additionalImages.map(file => `/uploads/services/${file.name}`);

    const service = new Service({
      name,
      displayTitle,
      group,
      price,
      displayImage: displayImagePath,
      additionalImages: additionalImagePaths,
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