// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Uploads a file to Cloudinary
 * @param {string} dataURI - The base64 or URL of the image
 * @param {string} folder - The Cloudinary folder where the file should be stored
 * @returns {Promise<string>} - The URL of the uploaded file or an empty string if upload fails
 */
export async function uploadToCloudinary(dataURI: string, folder: string): Promise<string> {
  if (!dataURI || typeof dataURI !== 'string') {
    console.error('Cloudinary Error: Invalid dataURI provided.');
    return '';
  }

  try {
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      timeout: 60000,
    });

    if (!result?.secure_url) {
      throw new Error('Upload successful, but secure_url is missing');
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);

    try {
      console.log('Retrying Cloudinary upload...');
      const retryResult = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'auto',
        timeout: 60000,
      });
      return retryResult.secure_url || '';
    } catch (retryError) {
      console.error('Cloudinary retry failed:', retryError);
      return '';
    }
  }
}