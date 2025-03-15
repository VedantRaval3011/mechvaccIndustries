// app/api/services/route.ts
import { NextRequest, NextResponse } from "next/server";
import  connectToDatabase  from "@/lib/db";
import Service from "@/models/service.model";

export async function GET() {
  try {
    await connectToDatabase();
    const services = await Service.find({});
    return NextResponse.json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();
    const formData = await req.formData();
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const displayTitle = formData.get("displayTitle") as string;
    const group = formData.get("group") as string;
    const price = formData.get("price") ? parseFloat(formData.get("price") as string) : undefined;
    const displayImage = formData.get("displayImage") as File | string;
    const additionalImages = formData.getAll("additionalImages") as (File | string)[];
    const video = formData.get("video") as string;
    const pdf = formData.get("pdf") as string;
    const seoKeywords = formData.get("seoKeywords") as string;

    const updateData: any = {
      name,
      displayTitle,
      group,
      price,
      video: video || undefined,
      pdf: pdf || undefined,
      seoKeywords: seoKeywords || undefined,
    };

    if (displayImage instanceof File) {
      updateData.displayImage = `/uploads/services/${displayImage.name}`; // Replace with actual upload logic
    } else {
      updateData.displayImage = displayImage;
    }

    if (additionalImages.length > 0) {
      updateData.additionalImages = additionalImages.map((img) =>
        img instanceof File ? `/uploads/services/${img.name}` : img
      );
    }

    const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Service ID is required" }, { status: 400 });
    }

    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}