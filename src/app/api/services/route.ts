import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import ServiceModel from '@/models/service.model';
import { CustomSection, Service } from '@/types/service';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function GET() {
  try {
    await connectToDatabase();
    const services = await ServiceModel.find({});
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const id = formData.get('id') as string;

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const toBase64 = async (file: File): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${file.type};base64,${buffer.toString('base64')}`;
    };

    const _id = formData.get('_id') as string;
    const name = formData.get('name') as string;
    const displayTitle = formData.get('displayTitle') as string;
    const group = formData.get('group') as string;
    const priceLabel = formData.get('priceLabel') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : undefined;
    const displayImage = formData.get('displayImage') as File | string;
    const additionalImages = formData.getAll('additionalImages') as (File | string)[];
    const video = formData.get('video') as string;
    const pdf = formData.get('pdf') as string;
    const seoKeywords = formData.get('seoKeywords') as string;
    const applications = formData.get('applications') as string | undefined;
    const customSectionsRaw = formData.get('customSections') as string;

    // Parse customSections
    let customSections: CustomSection[] = [];
    if (customSectionsRaw) {
      try {
        customSections = JSON.parse(customSectionsRaw);
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

    // Handle display image upload
    let displayImageUrl = '';
    if (displayImage instanceof File) {
      const displayImageBase64 = await toBase64(displayImage);
      displayImageUrl = await uploadToCloudinary(displayImageBase64, 'services/display');
    } else if (typeof displayImage === 'string') {
      displayImageUrl = displayImage;
    }

    // Handle additional images upload
    const additionalImageUrls = await Promise.all(
      additionalImages.map(async (item) => {
        if (item instanceof File) {
          const base64 = await toBase64(item);
          return await uploadToCloudinary(base64, 'services/additional');
        }
        return item as string;
      })
    );

    // Initialize updateData
    const updateData: Partial<Service> = {
      _id,
      name,
      displayTitle,
      group,
      priceLabel,
      description,
      price,
      displayImage: displayImageUrl || undefined,
      additionalImages: additionalImageUrls.length > 0 ? additionalImageUrls : [],
      video: video || undefined,
      pdf: pdf || undefined,
      seoKeywords: seoKeywords || undefined,
      applications: applications || undefined,
      customSections: customSections.length > 0 ? customSections : undefined,
      specifications: [],
      queries: [],
    };

    const updatedService = await ServiceModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: 'Failed to update service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    const deletedService = await ServiceModel.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted successfully', id });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}