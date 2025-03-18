// app/api/enquiry/users/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import  Enquiry  from "@/models/enquiry.model";

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    return NextResponse.json(enquiries, { status: 200 });
  } catch (error) {
    console.error("Error fetching enquiry users:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiry users" },
      { status: 500 }
    );
  }
}