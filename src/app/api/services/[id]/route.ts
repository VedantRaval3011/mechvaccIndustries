// app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db"; // Assuming this replaces dbConnect
import Service from "@/models/service.model"; // Use Service model
import { uploadToCloudinary } from "@/lib/cloudinary";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const service = await Service.findById(params.id);
    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    return NextResponse.json(service);
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const data = await req.formData();

    const toBase64 = async (file: File): Promise<string> => {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${file.type};base64,${buffer.toString("base64")}`;
    };

    let displayImageUrl = data.get("displayImage") as string;
    if (data.get("displayImage") instanceof File) {
      const displayImageBase64 = await toBase64(data.get("displayImage") as File);
      displayImageUrl = await uploadToCloudinary(displayImageBase64, "services/display");
    }

    const additionalImagesFiles = data.getAll("additionalImages");
    const additionalImageUrls = await Promise.all(
      additionalImagesFiles.map(async (item) => {
        if (item instanceof File) {
          const base64 = await toBase64(item);
          return await uploadToCloudinary(base64, "services/additional");
        }
        return item as string;
      })
    );

    const updatedService = await Service.findByIdAndUpdate(
      params.id,
      {
        name: data.get("name"),
        displayTitle: data.get("displayTitle"),
        group: data.get("group"),
        price: data.get("price") ? parseFloat(data.get("price") as string) : undefined,
        displayImage: displayImageUrl,
        additionalImages: additionalImageUrls,
        video: data.get("video") || undefined,
        pdf: data.get("pdf") || undefined,
        seoKeywords: data.get("seoKeywords") || undefined,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(updatedService);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();

    const deletedService = await Service.findByIdAndDelete(params.id);

    if (!deletedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Service deleted successfully",
      id: params.id,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service", details: errorMessage },
      { status: 500 }
    );
  }
}