"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Service } from "@/types/service";
import { useEffect, useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

// Custom type guard for FileList
const isFileList = (value: unknown): value is FileList =>
  value !== null &&
  typeof value === "object" &&
  "length" in value &&
  "item" in value;

// Schema for custom sections
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

// Define the form schema
const createSchema = () =>
  z.object({
    name: z.string().min(1, "Service name is required"),
    displayTitle: z.string().min(1, "Display title is required"),
    group: z.string().min(1, "Group is required"),
    description: z.string().optional(),
    displayImage: z
      .unknown()
      .refine(isFileList, "Display image must be a file")
      .refine(
        (files: FileList) => files.length === 1,
        "Display image is required"
      )
      .transform((files: FileList) => files[0] as File),
    additionalImages: z
      .array(
        z
          .unknown()
          .refine(isFileList, "Additional image must be a file")
          .transform((files: FileList) => (files.length > 0 ? files[0] : null))
      )
      .optional()
      .transform(
        (files) => files?.filter((file): file is File => file !== null) ?? []
      ),
    video: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    pdf: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    seoKeywords: z.string().optional(),
    customSections: z.array(customSectionSchema).optional(),
  });

type FormData = z.infer<ReturnType<typeof createSchema>>;

interface AddServiceProps {
  onNext: (id: string, data: Partial<Service>) => void;
}

export default function AddService({ onNext }: AddServiceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [displayImagePreview, setDisplayImagePreview] = useState<string | null>(
    null
  );
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<
    string[]
  >([]);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<FormData>({
    resolver: zodResolver(createSchema()),
    mode: "onBlur",
    defaultValues: {
      name: "",
      displayTitle: "",
      group: "",
      description: "",
      displayImage: undefined,
      additionalImages: [],
      video: "",
      pdf: "",
      seoKeywords: "",
      customSections: [],
    },
  });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "customSections",
  });

  const {
    fields: additionalImageFields,
    append: appendImage,
    remove: removeImage,
  } = useFieldArray<FormData, "additionalImages">({
    control,
    name: "additionalImages",
  });

  // Watch the name field for real-time validation
  const serviceName = watch("name");

  // Check name uniqueness with debounce
  useEffect(() => {
    if (!serviceName || serviceName.length < 3) {
      setNameError(null);
      return;
    }

    const checkNameUniqueness = async () => {
      setIsCheckingName(true);
      try {
        const response = await fetch(
          `/api/services/check-name?name=${encodeURIComponent(serviceName)}`
        );
        const data = await response.json();
        if (data.exists) {
          setNameError("Service name must be unique");
          alert("Service name must be unique");
        } else {
          setNameError(null);
        }
      } catch (error) {
        console.error("Error checking name uniqueness:", error);
        setNameError("Error checking name uniqueness");
      } finally {
        setIsCheckingName(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkNameUniqueness();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [serviceName]);

  // Handle display image preview
  const displayImageField = watch("displayImage");
  useEffect(() => {
    if (displayImageField instanceof File) {
      const objectUrl = URL.createObjectURL(displayImageField);
      setDisplayImagePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [displayImageField]);

  // Handle additional images preview
  const additionalImagesField = watch("additionalImages");
  useEffect(() => {
    if (additionalImagesField && additionalImagesField.length > 0) {
      const previews = additionalImagesField.map((file) =>
        file ? URL.createObjectURL(file) : ""
      );
      setAdditionalImagePreviews(previews);
      return () => previews.forEach((url) => URL.revokeObjectURL(url));
    } else {
      setAdditionalImagePreviews([]);
    }
  }, [additionalImagesField]);

  const videoUrl = watch("video");
  const pdfUrl = watch("pdf");

  const onSubmit = async (data: FormData) => {
    if (nameError) {
      alert("Please choose a unique service name before proceeding.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("displayTitle", data.displayTitle);
    formData.append("group", data.group);
    formData.append("description", data.description || "");
    formData.append("displayImage", data.displayImage);
    if (data.additionalImages && data.additionalImages.length > 0) {
      data.additionalImages.forEach((file) =>
        formData.append("additionalImages", file)
      );
    }
    formData.append("video", data.video || "");
    formData.append("pdf", data.pdf || "");
    formData.append("seoKeywords", data.seoKeywords || "");
    formData.append(
      "customSections",
      JSON.stringify(data.customSections || [])
    );

    try {
      const res = await fetch("/api/services/step1", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to create service");
      }

      const result = await res.json();

      const serviceData: Partial<Service> = {
        name: data.name,
        displayTitle: data.displayTitle,
        group: data.group,
        description: data.description,
        displayImage: displayImagePreview || "",
        additionalImages: additionalImagePreviews,
        video: data.video,
        pdf: data.pdf,
        seoKeywords: data.seoKeywords,
        customSections: data.customSections,
      };

      onNext(result.id, serviceData);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to create service. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8 p-2 bg-white rounded-2xl"
    >
      <h2 className="text-3xl font-bold text-gray-800 border-b pb-4">
        Service Details
      </h2>

      {(isLoading || isCheckingName) && (
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
            {isLoading ? "Uploading service details..." : "Checking name..."}
          </span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Name
          </label>
          <div className="relative">
            <input
              {...register("name")}
              placeholder="Enter service name"
              className={`w-full p-3 border ${
                nameError ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all`}
              disabled={isLoading}
            />
            {isCheckingName && (
              <div className="absolute right-3 top-3">
                <svg
                  className="animate-spin h-5 w-5 text-gray-400"
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
              </div>
            )}
          </div>
          {nameError && (
            <p className="text-red-500 text-sm mt-1">{nameError}</p>
          )}
          {errors.name && !nameError && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Title
          </label>
          <input
            {...register("displayTitle")}
            placeholder="Enter display title"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
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
            placeholder="Enter group"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.group && (
            <p className="text-red-500 text-sm mt-1">{errors.group.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Enter service description"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
            rows={4}
            disabled={isLoading}
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
                disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
                              {...props}
                            />
                          ),
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
          className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white transition-all"
          disabled={isLoading}
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
          className="w-full p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)] transition-all"
          disabled={isLoading}
        />
        {errors.displayImage?.message && (
          <p className="text-red-500 text-sm mt-1">
            {errors.displayImage.message}
          </p>
        )}
        {displayImagePreview && (
          <Image
            src={displayImagePreview}
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
              {...register(`additionalImages.${index}`)}
              type="file"
              accept="image/*"
              className="flex-1 p-3 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--color-green)] file:text-white hover:file:bg-[var(--color-green-gradient-end)] transition-all"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="p-2 text-red-500 hover:text-red-700 transition-colors"
              disabled={isLoading}
            >
              ✕
            </button>
            {additionalImagePreviews[index] && (
              <Image
                src={additionalImagePreviews[index]}
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
          onClick={() => appendImage(null)}
          className="mt-2 inline-flex items-center px-4 py-2 border border-[var(--color-green)] text-sm font-medium rounded-full text-[var(--color-green)] hover:bg-[var(--color-green)] hover:text-white transition-all"
          disabled={isLoading}
        >
          + Add More Images
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SEO Keywords
        </label>
        <input
          {...register("seoKeywords")}
          placeholder="Enter SEO keywords (comma-separated)"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.seoKeywords && (
          <p className="text-red-500 text-sm mt-1">
            {errors.seoKeywords.message}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-2">e.g., service, offer, deal</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Video URL
        </label>
        <input
          {...register("video")}
          placeholder="Enter video URL"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.video && (
          <p className="text-red-500 text-sm mt-1">{errors.video.message}</p>
        )}
        {videoUrl ? (
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-green)] mt-2 block hover:underline"
          >
            {videoUrl}
          </a>
        ) : (
          <p className="text-gray-500 text-sm mt-2">
            e.g., https://example.com/video.mp4
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          PDF URL
        </label>
        <input
          {...register("pdf")}
          placeholder="Enter PDF URL"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
          disabled={isLoading}
        />
        {errors.pdf && (
          <p className="text-red-500 text-sm mt-1">{errors.pdf.message}</p>
        )}
        {pdfUrl ? (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-green)] mt-2 block hover:underline"
          >
            {pdfUrl}
          </a>
        ) : (
          <p className="text-gray-500 text-sm mt-2">
            e.g., https://example.com/document.pdf
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full inline-flex justify-center items-center px-6 py-3 text-lg font-semibold text-white bg-gradient-to-r from-[var(--color-green-gradient-start)] to-[var(--color-green-gradient-end)] rounded-full hover:from-[var(--color-green-gradient-end)] hover:to-[var(--color-green-gradient-start)] transition-all transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-50"
        disabled={isLoading || isCheckingName || !!nameError}
      >
        Next
      </button>
    </form>
  );
}
