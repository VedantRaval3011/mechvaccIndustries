import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure cloudinary with the existing credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder') || 'uploads';
    
    // Generate timestamp
    const timestamp = Math.round(new Date().getTime() / 1000);
    
    // Generate signature using API secret
    // Do NOT include api_key or cloud_name in the signature generation object 
    // per Cloudinary docs, only parameters that will be sent to the API.
    const signature = cloudinary.utils.api_sign_request(
      { 
        timestamp, 
        folder 
      },
      process.env.CLOUDINARY_API_SECRET || ''
    );
    
    return NextResponse.json({ 
      timestamp, 
      signature, 
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    console.error('Error generating cloudinary signature:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
