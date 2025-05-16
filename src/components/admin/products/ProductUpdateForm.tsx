"use client";

import { useForm, useFieldArray, FieldError } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";

interface ProductWithCallbacks extends Product {
  onUpdate?: (updatedProduct: Product) => void;
  onDelete?: () => void;
}

// Custom validation function to check name uniqueness
const checkNameUniqueness = async (name: string, currentProductId: string) => {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products: Product[] = await response.json();
    return !products.some(
      (product) => product.name.toLowerCase() === name.toLowerCase() && product._id !== currentProductId
    );
  } catch (error) {
    console.error("Error checking name uniqueness:", error);
    return false; // Conservatively assume non-unique on error
  }
};

// Zod schema with uniqueness validation
const updateSchema = z.object({
  _id: z.string().optional(), // Added to have access in the form
  name: z.string().min(1, "Product name is required"),
  displayTitle: z.string().min(1, "Display title is required"),
  group: z.string().min(1, "Group is required"),
  description: z.string().optional(),
  displayImage: z.any().optional(),
  additionalImages: z
    .array(
      z.union([
        z.object({ file: z.any().optional() }),
        z.object({ url: z.string() }),
      ])
    )
    .optional(),
  video: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pdf: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  seoKeywords: z.string().optional(),
  specifications: z
    .array(
      z.object({
        title: z.string().min(1, "Specification title is required"),
        value: z.string().min(1, "Specification value is required"),
      })
    )
    .optional(),
  queries: z
    .array(
      z.object({
        title: z.string().min(1, "Query title is required"),
        type: z.enum(["number", "string", "dropdown", "number + checkbox"]),
      })
    )
    .optional(),
});

type UpdateFormData = z.infer<typeof updateSchema>;

interface ProductUpdateFormProps {
  product: ProductWithCallbacks;
  onUpdateComplete: (updatedProduct: Product) => void;
  onDeleteComplete: () => void;
}

export default function ProductUpdateForm({
  product,
  onUpdateComplete,
  onDeleteComplete,
}: ProductUpdateFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewDisplayImage, setPreviewDisplayImage] = useState<string>(
    product.displayImage || ""
  );
  const [previewAdditionalImages, setPreviewAdditionalImages] = useState<
    string[]
  >(product.additionalImages || []);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const handleNewProduct = () => {
    window.location.reload();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control,
  } = useForm<UpdateFormData>({
    resolver: zodResolver(updateSchema),
    defaultValues: {
      _id: product._id,
      name: product.name,
      displayTitle: product.displayTitle,
      group: product.group,
      description: product.description,
      displayImage: undefined,
      additionalImages: product.additionalImages
        ? product.additionalImages.map((url: string) => ({ url }))
        : [],
      video: product.video || "",
      pdf: product.pdf || "",
      seoKeywords: product.seoKeywords || "",
      specifications: product.specifications || [],
      queries: product.queries || [],
    },
  });

  const {
    fields: additionalImageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray({
    control,
    name: "additionalImages",
  });

  const {
    fields: specFields,
    append: appendSpec,
    remove: removeSpec,
  } = useFieldArray({
    control,
    name: "specifications",
  });

  const {
    fields: queryFields,
    append: appendQuery,
    remove: removeQuery,
  } = useFieldArray({
    control,
    name: "queries",
  });

  useEffect(() => {
    reset({
      _id: product._id,
      name: product.name,
      displayTitle: product.displayTitle,
      group: product.group,
      description: product.description,
      displayImage: undefined,
      additionalImages: product.additionalImages
        ? product.additionalImages.map((url: string) => ({ url }))
        : [],
      video: product.video || "",
      pdf: product.pdf || "",
      seoKeywords: product.seoKeywords || "",
      specifications: product.specifications || [],
      queries: product.queries || [],
    });
    setPreviewDisplayImage(product.displayImage || "");
    setPreviewAdditionalImages(product.additionalImages || []);
    // Reset name error when product changes
    setNameError(null);
  }, [product, reset]);

  const displayImageFile = watch("displayImage");
  const additionalImagesFiles = watch("additionalImages");
  const productName = watch("name");
  const productId = watch("_id");

  // Check name uniqueness when the name changes
  useEffect(() => {
    const checkName = async () => {
      if (!productName || productName === product.name) {
        setNameError(null);
        return;
      }

      setIsCheckingName(true);
      try {
        const isUnique = await checkNameUniqueness(productName, productId || '');
        if (!isUnique) {
          setNameError("Product name must be unique");
        } else {
          setNameError(null);
        }
      } catch (error) {
        console.error("Error checking name uniqueness:", error);
      } finally {
        setIsCheckingName(false);
      }
    };

    // Use a debounce to avoid too many requests
    const timeoutId = setTimeout(checkName, 500);
    return () => clearTimeout(timeoutId);
  }, [productName, productId, product.name]);

  useEffect(() => {
    if (displayImageFile && displayImageFile.length > 0) {
      setPreviewDisplayImage(URL.createObjectURL(displayImageFile[0]));
    }
  }, [displayImageFile]);

  useEffect(() => {
    if (additionalImagesFiles) {
      const newPreviews = additionalImagesFiles.map((item) => {
        if ("file" in item && item.file && item.file.length > 0) {
          return URL.createObjectURL(item.file[0]);
        }
        if ("url" in item && item.url) {
          return item.url;
        }
        return "";
      });
      setPreviewAdditionalImages(newPreviews);
    }
  }, [additionalImagesFiles]);

  const onSubmit = async (data: UpdateFormData) => {
    // Check name uniqueness before submitting
    if (data.name !== product.name) {
      setIsCheckingName(true);
      const isUnique = await checkNameUniqueness(data.name, product._id || '');
      setIsCheckingName(false);
      
      if (!isUnique) {
        setNameError("Product name must be unique");
        return; // Prevent form submission
      }
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("displayTitle", data.displayTitle);
      formData.append("group", data.group);
      formData.append("description", data.description || "");
      if (data.displayImage && data.displayImage.length > 0) {
        formData.append("displayImage", data.displayImage[0]);
      } else {
        formData.append("displayImage", product.displayImage || "");
      }
      if (data.additionalImages && data.additionalImages.length > 0) {
        data.additionalImages.forEach((item) => {
          if ("file" in item && item.file && item.file.length > 0) {
            formData.append("additionalImages", item.file[0]);
          } else if ("url" in item && item.url) {
            formData.append("additionalImages", item.url);
          }
        });
      }
      formData.append("video", data.video ?? "");
      formData.append("pdf", data.pdf ?? "");
      formData.append("seoKeywords", data.seoKeywords ?? "");

      const mainResponse = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        body: formData,
      });

      if (!mainResponse.ok) {
        throw new Error("Failed to update main product details");
      }

      const specResponse = await fetch(`/api/products/step2/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specifications: data.specifications || [] }),
      });

      if (!specResponse.ok) {
        throw new Error("Failed to update specifications");
      }

      const queryResponse = await fetch(`/api/products/step3/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: data.queries || [] }),
      });

      if (!queryResponse.ok) {
        throw new Error("Failed to update queries");
      }

      const updatedProduct: Product = await queryResponse.json();

      if (product.onUpdate) {
        product.onUpdate(updatedProduct);
      }
      onUpdateComplete(updatedProduct);

      reset({
        _id: updatedProduct._id,
        name: updatedProduct.name,
        displayTitle: updatedProduct.displayTitle,
        group: updatedProduct.group,
        description: updatedProduct.description,
        displayImage: undefined,
        additionalImages: updatedProduct.additionalImages
          ? updatedProduct.additionalImages.map((url) => ({ url }))
          : [],
        video: updatedProduct.video || "",
        pdf: updatedProduct.pdf || "",
        seoKeywords: updatedProduct.seoKeywords || "",
        specifications: updatedProduct.specifications || [],
        queries: updatedProduct.queries || [],
      });

      setPreviewDisplayImage(updatedProduct.displayImage || "");
      setPreviewAdditionalImages(updatedProduct.additionalImages || []);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/products/${product._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      if (product.onDelete) {
        product.onDelete();
      }
      onDeleteComplete();
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 p-2 bg-white rounded-2xl">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-800">
          Update Product
        </h2>
        <button
          type="button"
          onClick={handleNewProduct}
          className="px-4 py-2 text-sm font-medium text-white bg-[var(--color-green)] rounded-full hover:bg-[var(--color-green-gradient-end)] transition-all"
        >
          New Product
        </button>
      </div>

      {(isLoading || isDeleting || isCheckingName) && (
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <svg
            className="animate-spin h-5 w-5 mr-3 text-[var(--color-green)]"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-gray-700">
            {isLoading 
              ? "Updating product..." 
              : isDeleting 
                ? "Deleting product..." 
                : "Checking name..."}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              {...register("name")}
              className={`w-full p-3 border ${
                nameError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent`}
              disabled={isLoading || isDeleting}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {typeof errors.name?.message === "string" ? errors.name.message : null}
              </p>
            )}
            {nameError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {nameError}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Title
            </label>
            <input
              {...register("displayTitle")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
              disabled={isLoading || isDeleting}
            />
            {errors.displayTitle && (
              <p className="text-red-500 text-sm mt-1">
                {errors.displayTitle.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Group
            </label>
            <input
              {...register("group")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
              disabled={isLoading || isDeleting}
            />
            {errors.group && (
              <p className="text-red-500 text-sm mt-1">
                {errors.group.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              {...register("description")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
              disabled={isLoading || isDeleting}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Image
          </label>
          <input
            {...register("displayImage")}
            type="file"
            accept="image/*"
            className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)]"
            disabled={isLoading || isDeleting}
          />
          {previewDisplayImage && (
            <img
              src={previewDisplayImage}
              alt="Display Preview"
              className="mt-4 h-40 w-auto rounded-lg shadow-md"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Images
          </label>
          {additionalImageFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4 mb-4">
              <input
                {...register(`additionalImages.${index}.file` as const)}
                type="file"
                accept="image/*"
                className="flex-1 p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)]"
                disabled={isLoading || isDeleting}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                disabled={isLoading || isDeleting}
              >
                ✕
              </button>
              {previewAdditionalImages[index] && (
                <img
                  src={previewAdditionalImages[index]}
                  alt="Additional Preview"
                  className="h-24 w-auto rounded-lg shadow-md"
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendImage({ file: undefined })}
            className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white"
            disabled={isLoading || isDeleting}
          >
            + Add More Images
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video URL
          </label>
          <input
            {...register("video")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
            disabled={isLoading || isDeleting}
          />
          {errors.video && (
            <p className="text-red-500 text-sm mt-1">{errors.video.message}</p>
          )}
          {watch("video") && (
            <a
              href={watch("video")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-green)] mt-2 block hover:underline"
            >
              {watch("video")}
            </a>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PDF URL
          </label>
          <input
            {...register("pdf")}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
            disabled={isLoading || isDeleting}
          />
          {errors.pdf && (
            <p className="text-red-500 text-sm mt-1">{errors.pdf.message}</p>
          )}
          {watch("pdf") && (
            <a
              href={watch("pdf")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-green)] mt-2 block hover:underline"
            >
              {watch("pdf")}
            </a>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SEO Keywords
          </label>
          <input
            {...register("seoKeywords")}
            placeholder="Enter SEO keywords (comma-separated)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
          />
          {errors.seoKeywords && (
            <p className="text-red-500 text-sm mt-1">
              {errors.seoKeywords.message}
            </p>
          )}
          <p className="text-gray-500 text-sm mt-2">
            e.g., product, sale, discount
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specifications
          </label>
          {specFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <input
                  {...register(`specifications.${index}.title` as const)}
                  placeholder="Title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
                  disabled={isLoading || isDeleting}
                />
                {errors.specifications?.[index]?.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specifications[index]?.title?.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <input
                  {...register(`specifications.${index}.value` as const)}
                  placeholder="Value"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
                  disabled={isLoading || isDeleting}
                />
                {errors.specifications?.[index]?.value && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specifications[index]?.value?.message}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeSpec(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                disabled={isLoading || isDeleting}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendSpec({ title: "", value: "" })}
            className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white"
            disabled={isLoading || isDeleting}
          >
            + Add Specification
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Queries
          </label>
          {queryFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <input
                  {...register(`queries.${index}.title` as const)}
                  placeholder="Query Title"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
                  disabled={isLoading || isDeleting}
                />
                {errors.queries?.[index]?.title && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.queries[index]?.title?.message}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <select
                  {...register(`queries.${index}.type` as const)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
                  disabled={isLoading || isDeleting}
                >
                  <option value="number">Number</option>
                  <option value="string">Message</option>
                </select>
                {errors.queries?.[index]?.type &&
                  typeof errors.queries[index]?.type === "object" && (
                    <p className="text-red-500 text-sm mt-1">
                      {(errors.queries[index]?.type as FieldError).message}
                    </p>
                  )}
              </div>
              <button
                type="button"
                onClick={() => removeQuery(index)}
                className="p-2 text-red-500 hover:text-red-700 transition-colors"
                disabled={isLoading || isDeleting}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendQuery({ title: "", type: "string" })}
            className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white"
            disabled={isLoading || isDeleting}
          >
            + Add Query
          </button>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-[var(--color-green-gradient-start)] to-[var(--color-green-gradient-end)] rounded-full hover:from-[var(--color-green-gradient-end)] hover:to-[var(--color-green-gradient-start)] transition-all disabled:opacity-50"
            disabled={isLoading || isDeleting || isCheckingName || !!nameError}
          >
            Update Product
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 px-6 py-3 text-lg font-semibold text-white bg-red-600 rounded-full hover:bg-red-700 transition-all disabled:opacity-50"
            disabled={isLoading || isDeleting}
          >
            Delete Product
          </button>
        </div>
      </form>
    </div>
  );
}