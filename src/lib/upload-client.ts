/**
 * Helper function to upload an image directly from the browser to Cloudinary
 * using a securely generated signature from our backend.
 * 
 * @param file The file object to upload
 * @param folder The folder in Cloudinary to upload the file to
 * @returns The secure URL string of the uploaded file
 */
export async function uploadFileToCloudinary(file: File, folder: string): Promise<string> {
  // 1. Get the upload signature from our backend
  const signRes = await fetch(`/api/cloudinary/sign?folder=${encodeURIComponent(folder)}`);
  
  if (!signRes.ok) {
    throw new Error('Failed to get Cloudinary upload signature');
  }
  
  const signData = await signRes.json();
  
  // 2. Prepare the payload for Cloudinary API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signData.apiKey);
  formData.append('timestamp', signData.timestamp.toString());
  formData.append('signature', signData.signature);
  formData.append('folder', signData.folder);
  
  // 3. Upload directly to Cloudinary bypassing Next.js server limits (Vercel 4.5MB Serverless limit)
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!uploadRes.ok) {
    const errorData = await uploadRes.json();
    throw new Error(`Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`);
  }
  
  const uploadData = await uploadRes.json();
  
  return uploadData.secure_url;
}
