// app/components/AddService.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Service } from '@/types/service'; 
import { useEffect, useState } from 'react';

// Define proper types for the form data
type FormData = {
  name: string;
  displayTitle: string;
  group: string;
  price?: number;
  priceLabel?: string;
  description?: string;
  displayImage?: FileList;
  additionalImages?: FileList[];
  video?: string;
  pdf?: string;
  seoKeywords?: string;
};

const createServiceSchema = () => {
  // Check if we're on the client side
  const isClient = typeof window !== 'undefined';
  
  // Create a custom file validator to handle both client and server environments
  const FileListValidator = z.custom<FileList>((val) => {
    // Skip validation on server side
    if (!isClient) return true;
    
    // On client side, validate if it's a FileList
    return val instanceof FileList;
  });

  return z.object({
    name: z.string().min(1, 'Service name is required'),
    displayTitle: z.string().min(1, 'Display title is required'),
    group: z.string().min(1, 'Group is required'),
    price: z.number().min(0, 'Price must be positive').optional(),
    priceLabel: z.string().optional(),
    description: z.string().optional(),
    displayImage: FileListValidator.refine(
      files => files instanceof FileList && files.length === 1,
      'Display image is required'
    ),
    additionalImages: z.array(FileListValidator).default([]),
    video: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    pdf: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    seoKeywords: z.string().optional(),
  });
};

interface AddServiceProps {
  onNext: (id: string, data: Partial<Service>) => void;
}

export default function AddService({ onNext }: AddServiceProps) {
  const [schema, setSchema] = useState<z.ZodType<FormData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [additionalImageInputs, setAdditionalImageInputs] = useState<number[]>([]);
  const [displayImagePreview, setDisplayImagePreview] = useState<string | null>(null);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    // Set schema only on client side
    setSchema(createServiceSchema());
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: {
      name: '',
      displayTitle: '',
      group: '',
      price: undefined,
      priceLabel: '',
      description: '',
      additionalImages: [],
      video: '',
      pdf: '',
      seoKeywords: '',
    },
  });

  const displayImageFile = watch('displayImage');
  const additionalImagesFiles = watch('additionalImages');
  const videoUrl = watch('video');
  const pdfUrl = watch('pdf');

  // Update display image preview when file changes
  useEffect(() => {
    if (displayImageFile && displayImageFile[0]) {
      const objectUrl = URL.createObjectURL(displayImageFile[0]);
      setDisplayImagePreview(objectUrl);
      
      // Clean up the URL when component unmounts
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [displayImageFile]);

  // Update additional image previews when files change
  useEffect(() => {
    if (additionalImagesFiles && additionalImagesFiles.length > 0) {
      const newPreviews: string[] = [];
      
      for (let i = 0; i < additionalImagesFiles.length; i++) {
        if (additionalImagesFiles[i] && additionalImagesFiles[i][0]) {
          const objectUrl = URL.createObjectURL(additionalImagesFiles[i][0]);
          newPreviews[i] = objectUrl;
        }
      }
      
      setAdditionalImagePreviews(newPreviews);
      
      // Clean up URLs when component unmounts
      return () => {
        newPreviews.forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
      };
    }
  }, [additionalImagesFiles]);

  const addAdditionalImageInput = () => {
    setAdditionalImageInputs(prev => [...prev, Date.now()]);
  };

  const removeAdditionalImageInput = (index: number) => {
    setAdditionalImageInputs(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the URL if there's a preview
    if (additionalImagePreviews[index]) {
      URL.revokeObjectURL(additionalImagePreviews[index]);
    }
    
    // Update previews array
    setAdditionalImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    const formData = new FormData();
    
    // Add text fields
    formData.append('name', data.name);
    formData.append('displayTitle', data.displayTitle);
    formData.append('group', data.group);
    if (data.price !== undefined) {
      formData.append('price', data.price.toString());
    }
    if (data.priceLabel) {
      formData.append('priceLabel', data.priceLabel);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    
    // Add display image if provided
    if (data.displayImage && data.displayImage[0]) {
      formData.append('displayImage', data.displayImage[0]);
    }
    
    // Add additional images if provided
    if (data.additionalImages && data.additionalImages.length > 0) {
      for (let i = 0; i < data.additionalImages.length; i++) {
        const fileList = data.additionalImages[i];
        if (fileList && fileList[0]) {
          formData.append('additionalImages', fileList[0]);
        }
      }
    }
    
    // Add optional fields
    if (data.video) {
      formData.append('video', data.video);
    }
    if (data.pdf) {
      formData.append('pdf', data.pdf);
    }
    if (data.seoKeywords) {
      formData.append('seoKeywords', data.seoKeywords);
    }

    try {
      const res = await fetch('/api/services/step1', {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) {
        throw new Error('Failed to create service');
      }
      
      const result = await res.json();

      // Prepare service data to pass to the next step
      const serviceData: Partial<Service> = {
        name: data.name,
        displayTitle: data.displayTitle,
        group: data.group,
        price: data.price,
        priceLabel: data.priceLabel,
        description: data.description,
        displayImage: displayImagePreview || '',
        additionalImages: additionalImagePreviews.filter(url => !!url),
        video: data.video,
        pdf: data.pdf,
        seoKeywords: data.seoKeywords,
      };

      onNext(result.id, serviceData);
    } catch (error) {
      console.error('Error creating service:', error);
      // Handle error (could add error state and display to user)
    } finally {
      setIsLoading(false);
    }
  };

  if (!schema) {
    return <div>Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-2 bg-white rounded-2xl">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Service Details</h2>

      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <svg className="animate-spin h-5 w-5 mr-3 text-[var(--color-green)]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-700">Uploading service details...</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
          <input
            {...register('name')}
            placeholder="Enter service name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-base mt-1">{errors.name.message as string}</p>}
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">Display Title</label>
          <input
            {...register('displayTitle')}
            placeholder="Enter display title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.displayTitle && <p className="text-red-500 text-base mt-1">{errors.displayTitle.message as string}</p>}
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">Group</label>
          <input
            {...register('group')}
            placeholder="Enter group"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.group && <p className="text-red-500 text-base mt-1">{errors.group.message as string}</p>}
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">Price</label>
          <input
            {...register('price', { valueAsNumber: true })}
            type="number"
            placeholder="Enter price"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.price && <p className="text-red-500 text-base mt-1">{errors.price.message as string}</p>}
        </div>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Price Label</label>
        <input
          {...register('priceLabel')}
          placeholder="e.g., Monthly, One-time"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.priceLabel && <p className="text-red-500 text-base mt-1">{errors.priceLabel.message as string}</p>}
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Service Description</label>
        <textarea
          {...register('description')}
          placeholder="Enter service description"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          rows={4}
          disabled={isLoading}
        />
        {errors.description && <p className="text-red-500 text-base mt-1">{errors.description.message as string}</p>}
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Display Image</label>
        <input
          {...register('displayImage')}
          type="file"
          accept="image/*"
          className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)] transition-all"
          disabled={isLoading}
        />
        {errors.displayImage && <p className="text-red-500 text-base mt-1">{errors.displayImage.message as string}</p>}
        {displayImagePreview && (
          <img
            src={displayImagePreview}
            alt="Display Preview"
            className="mt-4 h-40 w-auto rounded-lg shadow-md"
          />
        )}
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Additional Images</label>
        {additionalImageInputs.map((id, index) => (
          <div key={id} className="flex items-center gap-4 mb-4">
            <input
              {...register(`additionalImages.${index}` as const)}
              type="file"
              accept="image/*"
              className="flex-1 p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)] transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => removeAdditionalImageInput(index)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
              disabled={isLoading}
            >
              ✕
            </button>
            {additionalImagePreviews[index] && (
              <img
                src={additionalImagePreviews[index]}
                alt="Additional Preview"
                className="h-24 w-auto rounded-lg shadow-md"
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addAdditionalImageInput}
          className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-base font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white transition-all"
          disabled={isLoading}
        >
          + Add More Images
        </button>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Video URL</label>
        <input
          {...register('video')}
          placeholder="Enter video URL"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.video && <p className="text-red-500 text-base mt-1">{errors.video.message as string}</p>}
        {videoUrl ? (
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-green)] mt-2 block hover:underline">
            {videoUrl}
          </a>
        ) : (
          <p className="text-gray-500 text-base mt-2">e.g., https://example.com/video.mp4</p>
        )}
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">PDF URL</label>
        <input
          {...register('pdf')}
          placeholder="Enter PDF URL"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.pdf && <p className="text-red-500 text-base mt-1">{errors.pdf.message as string}</p>}
        {pdfUrl ? (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-green)] mt-2 block hover:underline">
            {pdfUrl}
          </a>
        ) : (
          <p className="text-gray-500 text-base mt-2">e.g., https://example.com/document.pdf</p>
        )}
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">SEO Keywords</label>
        <input
          {...register('seoKeywords')}
          placeholder="Enter SEO keywords (comma-separated)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.seoKeywords && <p className="text-red-500 text-base mt-1">{errors.seoKeywords.message as string}</p>}
        <p className="text-gray-500 text-base mt-2">e.g., service, offer, deal</p>
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-[var(--color-green-gradient-start)] to-[var(--color-green-gradient-end)] rounded-full hover:from-[var(--color-green-gradient-end)] hover:to-[var(--color-green-gradient-start)] transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
        disabled={isLoading}
      >
        Next
      </button>
    </form>
  );
}