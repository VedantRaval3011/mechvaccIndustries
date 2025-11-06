import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Service from '@/models/service.model';
import { uploadToCloudinary } from '@/lib/cloudinary';
import mongoose from 'mongoose';
import { CustomSection } from '@/types/service';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID format' }, { status: 400 });
    }

    const service = await Service.findById(id);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const id = req.nextUrl.pathname.split('/').pop();
    const data = await req.formData();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID format' }, { status: 400 });
    }

    const toBase64 = async (file: File): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${file.type};base64,${buffer.toString('base64')}`;
    };

    let displayImageUrl = data.get('displayImage') as string;
    if (data.get('displayImage') instanceof File) {
      const displayImageBase64 = await toBase64(data.get('displayImage') as File);
      displayImageUrl = await uploadToCloudinary(displayImageBase64, 'services/display');
    }

    const additionalImagesFiles = data.getAll('additionalImages');
    const additionalImageUrls = await Promise.all(
      additionalImagesFiles.map(async (item) => {
        if (item instanceof File) {
          const base64 = await toBase64(item);
          return await uploadToCloudinary(base64, 'services/additional');
        }
        return item as string;
      })
    );

    // Parse customSections from FormData
    let customSections: CustomSection[] = [];
    const customSectionsRaw = data.get('customSections') as string;
    if (customSectionsRaw) {
      try {
        customSections = JSON.parse(customSectionsRaw);
        // Validate customSections format
        if (!Array.isArray(customSections)) {
          return NextResponse.json({ error: 'customSections must be an array' }, { status: 400 });
        }
        customSections = customSections.map((section) => ({
          title: section.title,
          content: section.content,
        }));
      } catch (e) {
        return NextResponse.json({ error: 'Invalid customSections format' }, { status: 400 });
      }
    }

    const updatedService = await Service.findByIdAndUpdate(
      id,
      {
        name: data.get('name') as string,
        displayTitle: data.get('displayTitle') as string,
        group: data.get('group') as string,
        price: data.get('price') ? parseFloat(data.get('price') as string) : undefined,
        priceLabel: (data.get('priceLabel') as string) || '',
        description: (data.get('description') as string) || '',
        applications: (data.get('applications') as string) || undefined,
        displayImage: displayImageUrl,
        additionalImages: additionalImageUrls,
        video: (data.get('video') as string) || undefined,
        pdf: (data.get('pdf') as string) || undefined,
        seoKeywords: (data.get('seoKeywords') as string) || undefined,
        customSections: customSections.length > 0 ? customSections : undefined,
        specifications: [],
        queries: [],
      },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    console.log('Updated service:', updatedService);
    return NextResponse.json(updatedService);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating service:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to update service', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const id = req.nextUrl.pathname.split('/').pop();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid service ID format' }, { status: 400 });
    }

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Service deleted successfully',
      id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting service:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to delete service', details: errorMessage },
      { status: 500 }
    );
  }
}