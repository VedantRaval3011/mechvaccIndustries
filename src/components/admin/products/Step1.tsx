// app/components/Step1.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Product } from '@/types/product';
import { useEffect, useState } from 'react';

const createSchema = () =>
  z.object({
    name: z.string().min(1, 'Product name is required'),
    displayTitle: z.string().min(1, 'Display title is required'),
    group: z.string().min(1, 'Group is required'),
    price: z.number().min(0, 'Price must be positive').optional(),
    displayImage: z
      .any()
      .refine(
        (files) => files instanceof FileList && files.length === 1,
        'Display image is required'
      )
      .transform((files) => (files instanceof FileList ? files[0] : files)),
    additionalImages: z.array(
      z
        .any()
        .transform((files) => (files instanceof FileList ? files[0] : files))
    ).optional(),
    video: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    pdf: z.string().url('Must be a valid URL').optional().or(z.literal('')),
    seoKeywords: z.string().optional(), // New SEO keywords field
  });

interface Step1Props {
  onNext: (id: string, data: Partial<Product>) => void;
}

export default function Step1({ onNext }: Step1Props) {
  const [schema, setSchema] = useState(() => createSchema());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSchema(createSchema());
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      displayTitle: '',
      group: '',
      price: undefined,
      displayImage: undefined,
      additionalImages: [],
      video: '',
      pdf: '',
      seoKeywords: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'additionalImages',
  });

  const displayImageFile = watch('displayImage');
  const additionalImagesFiles = watch('additionalImages');
  const videoUrl = watch('video');
  const pdfUrl = watch('pdf');

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('displayTitle', data.displayTitle);
    formData.append('group', data.group);
    formData.append('price', data.price?.toString() || '');
    formData.append('displayImage', data.displayImage);
    if (data.additionalImages) {
      data.additionalImages.forEach((file: File) => formData.append('additionalImages', file));
    }
    formData.append('video', data.video);
    formData.append('pdf', data.pdf);
    formData.append('seoKeywords', data.seoKeywords); // Add SEO keywords to form data

    const res = await fetch('/api/products/step1', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();

    const productData: Partial<Product> = {
      name: data.name,
      displayTitle: data.displayTitle,
      group: data.group,
      price: data.price,
      displayImage: URL.createObjectURL(data.displayImage),
      additionalImages: data.additionalImages
        ? data.additionalImages.map((file: File) => URL.createObjectURL(file))
        : [],
      video: data.video,
      pdf: data.pdf,
    };

    onNext(result.id, productData);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-2 bg-white rounded-2xl ">
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">Product Details</h2>

      {isLoading && (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <svg className="animate-spin h-5 w-5 mr-3 text-[var(--color-green)]" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-700">Uploading product details...</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input
            {...register('name')}
            placeholder="Enter product name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.name && <p className="text-red-500 text-base mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">Display Title</label>
          <input
            {...register('displayTitle')}
            placeholder="Enter display title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.displayTitle && <p className="text-red-500 text-base mt-1">{errors.displayTitle.message}</p>}
        </div>

        <div>
          <label className="block text-base font-medium text-gray-700 mb-1">Group</label>
          <input
            {...register('group')}
            placeholder="Enter group"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.group && <p className="text-red-500 text-base mt-1">{errors.group.message}</p>}
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
          {errors.price && <p className="text-red-500 text-base mt-1">{errors.price.message}</p>}
        </div>
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
        {errors.displayImage?.message && <p className="text-red-500 text-base mt-1">{errors.displayImage.message as string}</p>}
        {displayImageFile && displayImageFile instanceof File && (
          <img
            src={URL.createObjectURL(displayImageFile)}
            alt="Display Preview"
            className="mt-4 h-40 w-auto rounded-lg shadow-md"
          />
        )}
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Additional Images</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-4 mb-4">
            <input
              {...register(`additionalImages.${index}` as const)}
              type="file"
              accept="image/*"
              className="flex-1 p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-base file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)] transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
              disabled={isLoading}
            >
              ✕
            </button>
            {additionalImagesFiles && additionalImagesFiles[index] instanceof File && (
              <img
                src={URL.createObjectURL(additionalImagesFiles[index])}
                alt="Additional Preview"
                className="h-24 w-auto rounded-lg shadow-md"
              />
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => append(undefined)}
          className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-base font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white transition-all"
          disabled={isLoading}
        >
          + Add More Images
        </button>
      </div>
      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">SEO Keywords</label>
        <input
          {...register('seoKeywords')}
          placeholder="Enter SEO keywords (comma-separated)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.seoKeywords && <p className="text-red-500 text-base mt-1">{errors.seoKeywords.message}</p>}
        <p className="text-gray-500 text-base mt-2">e.g., product, sale, discount</p>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">Video URL</label>
        <input
          {...register('video')}
          placeholder="Enter video URL"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.video && <p className="text-red-500 text-base mt-1">{errors.video.message}</p>}
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
        {errors.pdf && <p className="text-red-500 text-base mt-1">{errors.pdf.message}</p>}
        {pdfUrl ? (
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-green)] mt-2 block hover:underline">
            {pdfUrl}
          </a>
        ) : (
          <p className="text-gray-500 text-base mt-2">e.g., https://example.com/document.pdf</p>
        )}
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