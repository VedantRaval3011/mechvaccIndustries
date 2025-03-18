// app/api/interested-users/route.ts
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { InterestedUser } from "@/models/interestedUser.model";

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI as string);
    }

    const interestedUsers = await InterestedUser.find().sort({ createdAt: -1 });
    return NextResponse.json(interestedUsers, { status: 200 });
  } catch (error) {
    console.error("Error fetching interested users:", error);
    return NextResponse.json(
      { error: "Failed to fetch interested users" },
      { status: 500 }
    );
  }
}