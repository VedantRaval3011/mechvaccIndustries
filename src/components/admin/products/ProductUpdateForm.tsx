"use client";

import { useForm, useFieldArray, FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

interface ProductWithCallbacks extends Product {
  onUpdate?: (updatedProduct: Product) => void;
  onDelete?: () => void;
}

// Custom type guard for FileList
const isFileList = (value: unknown): value is FileList =>
  value !== null &&
  typeof value === "object" &&
  "length" in value &&
  "item" in value;

// Custom validation function to check name uniqueness
const checkNameUniqueness = async (name: string, currentProductId: string) => {
  try {
    const response = await fetch("/api/products");
    if (!response.ok) throw new Error("Failed to fetch products");
    const products: Product[] = await response.json();
    return !products.some(
      (product) =>
        product.name.toLowerCase() === name.toLowerCase() &&
        product._id !== currentProductId
    );
  } catch (error) {
    console.error("Error checking name uniqueness:", error);
    return false; // Conservatively assume non-unique on error
  }
};

// Zod schema for custom sections
const customSectionSchema = z.object({
  title: z.string().min(1, "Section title is required"),
  content: z
    .string()
    .min(1, "Content is required")
    .refine(
      (value) => value.includes("#") || value.includes("##"),
      "Content must include at least one heading (# or ##) for SEO"
    ),
});

// Zod schema with corrected file handling and custom sections
const updateSchema = z.object({
  _id: z.string().optional(),
  name: z.string().min(1, "Product name is required"),
  displayTitle: z.string().min(1, "Display title is required"),
  group: z.string().min(1, "Group is required"),
  description: z.string().optional(),
  applications: z.string().optional(),
  displayImage: z
    .unknown()
    .optional()
    .refine(
      (value) => !value || isFileList(value),
      "Display image must be a file"
    )
    .transform((value: unknown) =>
      isFileList(value) && value.length > 0 ? value[0] : undefined
    ),
  additionalImages: z
    .array(
      z.object({
        file: z
          .unknown()
          .optional()
          .refine(
            (value) => !value || isFileList(value),
            "Additional image must be a file"
          )
          .transform((value: unknown) =>
            isFileList(value) && value.length > 0 ? value[0] : undefined
          ),
        url: z.string().optional(),
      })
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
  customSections: z.array(customSectionSchema).optional(),
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
      applications: product.applications || "",
      displayImage: undefined,
      additionalImages: product.additionalImages
        ? product.additionalImages.map((url: string) => ({
            url,
            file: undefined,
          }))
        : [],
      video: product.video || "",
      pdf: product.pdf || "",
      seoKeywords: product.seoKeywords || "",
      specifications: product.specifications || [],
      queries: product.queries || [],
      customSections: product.customSections || [],
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

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "customSections",
  });

  useEffect(() => {
    reset({
      _id: product._id,
      name: product.name,
      displayTitle: product.displayTitle,
      group: product.group,
      description: product.description,
      applications: product.applications || "",
      displayImage: undefined,
      additionalImages: product.additionalImages
        ? product.additionalImages.map((url: string) => ({
            url,
            file: undefined,
          }))
        : [],
      video: product.video || "",
      pdf: product.pdf || "",
      seoKeywords: product.seoKeywords || "",
      specifications: product.specifications || [],
      queries: product.queries || [],
      customSections: product.customSections || [],
    });
    setPreviewDisplayImage(product.displayImage || "");
    setPreviewAdditionalImages(product.additionalImages || []);
    setNameError(null);
  }, [product, reset]);

  const displayImageFile = watch("displayImage");
  const additionalImagesFiles = watch("additionalImages");
  const productName = watch("name");
  const productId = watch("_id");

  // Check name uniqueness
  useEffect(() => {
    const checkName = async () => {
      if (!productName || productName === product.name) {
        setNameError(null);
        return;
      }

      setIsCheckingName(true);
      try {
        const isUnique = await checkNameUniqueness(
          productName,
          productId || ""
        );
        setNameError(isUnique ? null : "Product name must be unique");
      } catch (error) {
        console.error("Error checking name uniqueness:", error);
      } finally {
        setIsCheckingName(false);
      }
    };

    const timeoutId = setTimeout(checkName, 500);
    return () => clearTimeout(timeoutId);
  }, [productName, productId, product.name]);

  // Handle display image preview
  useEffect(() => {
    if (displayImageFile instanceof File) {
      setPreviewDisplayImage(URL.createObjectURL(displayImageFile));
      return () => URL.revokeObjectURL(previewDisplayImage);
    }
  }, [displayImageFile]);

  // Handle additional images preview
  useEffect(() => {
    if (additionalImagesFiles) {
      const newPreviews = additionalImagesFiles.map((item) => {
        if (item.file instanceof File) {
          return URL.createObjectURL(item.file);
        }
        return item.url || "";
      });
      setPreviewAdditionalImages(newPreviews);
      return () => newPreviews.forEach((url) => URL.revokeObjectURL(url));
    }
  }, [additionalImagesFiles]);

  const onSubmit = async (data: UpdateFormData) => {
    if (data.name !== product.name) {
      setIsCheckingName(true);
      const isUnique = await checkNameUniqueness(data.name, product._id || "");
      setIsCheckingName(false);
      if (!isUnique) {
        setNameError("Product name must be unique");
        return;
      }
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("displayTitle", data.displayTitle);
      formData.append("group", data.group);
      formData.append("description", data.description || "");
      formData.append("applications", data.applications || "");
      if (data.displayImage instanceof File) {
        formData.append("displayImage", data.displayImage);
      } else {
        formData.append("displayImage", product.displayImage || "");
      }
      if (data.additionalImages && data.additionalImages.length > 0) {
        data.additionalImages.forEach((item) => {
          if (item.file instanceof File) {
            formData.append("additionalImages", item.file);
          } else if (item.url) {
            formData.append("additionalImages", item.url);
          }
        });
      }
      formData.append("video", data.video ?? "");
      formData.append("pdf", data.pdf ?? "");
      formData.append("seoKeywords", data.seoKeywords ?? "");
      formData.append(
        "customSections",
        JSON.stringify(data.customSections || [])
      );

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
        applications: updatedProduct.applications || "",
        displayImage: undefined,
        additionalImages: updatedProduct.additionalImages
          ? updatedProduct.additionalImages.map((url) => ({
              url,
              file: undefined,
            }))
          : [],
        video: updatedProduct.video || "",
        pdf: updatedProduct.pdf || "",
        seoKeywords: updatedProduct.seoKeywords || "",
        specifications: updatedProduct.specifications || [],
        queries: updatedProduct.queries || [],
        customSections: updatedProduct.customSections || [],
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
        <h2 className="text-3xl font-bold text-gray-800">Update Product</h2>
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
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
            {nameError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mt-2 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
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
            <textarea
              {...register("description")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
              rows={4}
              disabled={isLoading || isDeleting}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Custom Sections */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Custom Sections
          </h3>
          {sectionFields.map((section, index) => (
            <div
              key={section.id}
              className="mb-6 p-4 border border-gray-300 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-800">
                  Section {index + 1}
                </h4>
                <button
                  type="button"
                  onClick={() => removeSection(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  disabled={isLoading || isDeleting}
                >
                  ✕
                </button>
              </div>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section Title
                  </label>
                  <input
                    {...register(`customSections.${index}.title`)}
                    placeholder="e.g., Key Features, Applications, How It Works"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
                    disabled={isLoading || isDeleting}
                  />
                  {errors.customSections?.[index]?.title && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customSections[index].title?.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content (Markdown)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <textarea
                      {...register(`customSections.${index}.content`)}
                      placeholder={`# Section Heading\n- Feature 1\n- Feature 2\n\nUse headings (#, ##) for SEO-friendly content.`}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all font-mono text-sm"
                      rows={6}
                      disabled={isLoading || isDeleting}
                    />
                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Preview
                      </h4>
                      <div className="prose prose-sm max-w-none text-gray-700">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                          components={{
                            p: ({ node, ...props }) => (
                              <p className="text-gray-700 mb-2" {...props} />
                            ),
                            h1: ({ node, ...props }) => (
                              <h1
                                className="text-2xl font-bold text-gray-800 mt-6 mb-3"
                                {...props}
                              />
                            ),
                            h2: ({ node, ...props }) => (
                              <h2
                                className="text-xl font-semibold text-gray-800 mt-5 mb-2"
                                {...props}
                              />
                            ),
                            h3: ({ node, ...props }) => (
                              <h3
                                className="text-lg font-semibold text-gray-800 mt-4 mb-2"
                                {...props}
                              />
                            ),
                            ul: ({ node, ...props }) => (
                              <ul
                                className="list-disc list-inside text-gray-700 mb-2"
                                {...props}
                              />
                            ),
                            ol: ({ node, ...props }) => (
                              <ol
                                className="list-decimal list-inside text-gray-700 mb-2"
                                {...props}
                              />
                            ),
                            li: ({ node, ...props }) => (
                              <li className="text-gray-700 mb-1" {...props} />
                            ),
                            a: ({ node, ...props }) => (
                              <a
                                className="text-[var(--color-green)] hover:underline"
                                {...props}
                              />
                            ),
                            // Table styling components
                            table: ({ node, ...props }) => (
                              <table
                                className="min-w-full border-collapse border border-gray-300 mt-4 mb-4 text-sm"
                                {...props}
                              />
                            ),
                            thead: ({ node, ...props }) => (
                              <thead className="bg-gray-50" {...props} />
                            ),
                            th: ({ node, ...props }) => (
                              <th
                                className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left text-gray-800"
                                {...props}
                              />
                            ),
                            td: ({ node, ...props }) => (
                              <td
                                className="border border-gray-300 px-3 py-2 text-gray-700"
                                {...props}
                              />
                            ),
                            tr: ({ node, ...props }) => (
                              <tr className="hover:bg-gray-50" {...props} />
                            ),
                            // Code styling
                            code: ({ node, ...props }) => {
                              const isInline =
                                !props.className?.includes("language-");
                              return isInline ? (
                                <code
                                  className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800"
                                  {...props}
                                />
                              ) : (
                                <code
                                  className="block bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto"
                                  {...props}
                                />
                              );
                            },
                            pre: ({ node, ...props }) => (
                              <pre
                                className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto mb-4"
                                {...props}
                              />
                            ),
                            // Blockquote styling
                            blockquote: ({ node, ...props }) => (
                              <blockquote
                                className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
                                {...props}
                              />
                            ),
                            // Strong and emphasis
                            strong: ({ node, ...props }) => (
                              <strong
                                className="font-semibold text-gray-800"
                                {...props}
                              />
                            ),
                            em: ({ node, ...props }) => (
                              <em className="italic text-gray-700" {...props} />
                            ),
                          }}
                        >
                          {watch(`customSections.${index}.content`) ||
                            "Enter Markdown to see preview"}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                  {errors.customSections?.[index]?.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.customSections[index].content?.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendSection({ title: "", content: "" })}
            className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white"
            disabled={isLoading || isDeleting}
          >
            + Add Section
          </button>
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
            <Image
              src={previewDisplayImage}
              alt="Display Preview"
              className="mt-4 h-40 w-auto rounded-lg shadow-md"
              width={160}
              height={160}
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
                {...register(`additionalImages.${index}.file`)}
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
                <Image
                  src={previewAdditionalImages[index]}
                  alt="Additional Preview"
                  className="h-24 w-auto rounded-lg shadow-md"
                  width={96}
                  height={96}
                />
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendImage({ file: undefined, url: undefined })}
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
            disabled={isLoading || isDeleting}
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
                  {...register(`specifications.${index}.title`)}
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
                  {...register(`specifications.${index}.value`)}
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
                  {...register(`queries.${index}.title`)}
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
                  {...register(`queries.${index}.type`)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent"
                  disabled={isLoading || isDeleting}
                >
                  <option value="number">Number</option>
                  <option value="string">Message</option>
                  <option value="dropdown">Dropdown</option>
                  <option value="number + checkbox">Number + Checkbox</option>
                </select>
                {errors.queries?.[index]?.type && (
                  <p className="text-red-500 text-sm mt-1">
                    {(errors.queries[index]?.type as FieldError)?.message}
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
