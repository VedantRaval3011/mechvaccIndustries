"use client";

import { Product } from "@/types/product";
import {
  Star,
  Download,
  Play,
  Share2,
  Copy,
  Mail,
  Facebook,
  Send,
  ChevronDown,
  Eye,
  Package,
  Info,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import toast, { Toaster } from "react-hot-toast";
import Head from "next/head";
import remarkGfm from "remark-gfm";

interface ExtendedProduct extends Product {
  _id: string;
}

interface ProductDetailClientProps {
  product: ExtendedProduct;
  interestingProducts: ExtendedProduct[];
  slug: string;
}

const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export default function ProductDetailClient({
  product,
  interestingProducts,
  slug,
}: ProductDetailClientProps) {
  const [activeImage, setActiveImage] = useState<string>(
    product.displayImage || ""
  );
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);
  const [showInterestForm, setShowInterestForm] = useState<boolean>(false);
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<number, boolean>
  >({});
  const [defaultQueries] = useState([
    { title: "Name", type: "string" },
    { title: "Phone Number", type: "string" },
  ]);

  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(event.target as Node)
      ) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    setIsShareMenuOpen(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(
      `Check out this product: ${product.displayTitle}`
    );
    const body = encodeURIComponent(
      `I found this amazing product:\n\n${product.displayTitle}\n\n${window.location.href}\n\n${product.name}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareMenuOpen(false);
  };

  const shareToSocialMedia = (platform: "facebook" | "whatsapp") => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(
      `Check out this product: ${product.displayTitle}`
    );
    let shareUrl = "";
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case "whatsapp":
        shareUrl = `https://api.whatsapp.com/send?text=${title}%20${url}`;
        break;
    }
    if (shareUrl) window.open(shareUrl, "_blank");
    setIsShareMenuOpen(false);
  };

  const handleQueryChange = (queryTitle: string, value: string) => {
    setQueryValues((prev) => ({
      ...prev,
      [queryTitle]: value,
    }));
  };

  const submitInterest = async () => {
    try {
      setIsSubmitting(true);
      const allQueries = [...defaultQueries, ...(product.queries || [])];
      const uniqueQueries = Array.from(
        new Map(allQueries.map((query) => [query.title, query])).values()
      );
      const queriesWithValues = uniqueQueries.map((query) => ({
        ...query,
        value: queryValues[query.title] || "",
      }));

      const updateResponse = await fetch(`/api/products/step3/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queries: queriesWithValues }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || "Failed to update product queries");
      }

      const emailResponse = await fetch("/api/send-interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          productTitle: product.displayTitle,
          userQueries: queriesWithValues,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      setShowInterestForm(false);
      setShowThankYou(true);
      setQueryValues({});
      setTimeout(() => setShowThankYou(false), 5000);
    } catch (error) {
      console.error("Error submitting interest:", error);
      toast.error("Failed to submit interest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.displayTitle,
    description: product.description || product.name,
    category: product.group || "Product",
    brand: {
      "@type": "Brand",
      name: "Your Brand Name",
    },
    image: [product.displayImage, ...(product.additionalImages || [])].filter(
      Boolean
    ),
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "USD",
    },
    additionalProperty:
      product.specifications?.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.title,
        value: spec.value,
      })) || [],
  };

  function watch(path: string): string | null | undefined {
    // Split the path by dots to access nested properties
    const pathSegments = path.replace(/\[\d+\]/g, '.$&').split('.');
    
    // Since we're working with customSections content,
    // find the correct section based on index in the path
    const matches = path.match(/customSections\.(\d+)\.content/);
    if (matches && matches[1]) {
      const sectionIndex = parseInt(matches[1]);
      return product.customSections && product.customSections[sectionIndex]?.content;
    }
    
    return undefined;
  }

  return (
    <>
      <Head>
        <title>{product.displayTitle} | Mechvacc industries</title>
        <meta
          name="description"
          content={
            product.description || `${product.displayTitle} - ${product.name}`
          }
        />
        <meta
          name="keywords"
          content={
            product.seoKeywords || `${product.displayTitle}, ${product.group}`
          }
        />
        <meta property="og:title" content={product.displayTitle} />
        <meta
          property="og:description"
          content={product.description || product.name}
        />
        <meta property="og:image" content={product.displayImage} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={product.displayTitle} />
        <meta
          name="twitter:description"
          content={product.description || product.name}
        />
        <meta name="twitter:image" content={product.displayImage} />
        <link
          rel="canonical"
          href={typeof window !== "undefined" ? window.location.href : ""}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <Toaster position="top-center" />

      <div
        className="min-h-screen bg-[var(--color-gray-bg)] py-8 sm:py-16"
        itemScope
        itemType="https://schema.org/Product"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="mb-6 font-inter" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-gray-500">
              <li>
                <Link href="/" className="hover:text-[var(--color-green)]">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link
                  href="/products"
                  className="hover:text-[var(--color-green)]"
                >
                  Products
                </Link>
              </li>
              <li>/</li>
              <li
                className="text-[var(--color-green)] font-medium"
                aria-current="page"
              >
                {product.displayTitle}
              </li>
            </ol>
          </nav>

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Image Gallery Section */}
              <section className="p-6 lg:p-8" aria-label="Product Images">
                <motion.div
                  className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 shadow-inner"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: "100%", height: "500px" }}
                >
                  <Image
                    src={activeImage || "/no-image-placeholder.png"}
                    alt={`${product.displayTitle} - Main product image`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    style={{ objectFit: "contain", backgroundColor: "#f9f9f9" }}
                    quality={100}
                    itemProp="image"
                  />

                  {/* Image overlay for better visibility */}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full p-2">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </div>
                </motion.div>

                {/* Thumbnail Gallery */}
                {product.additionalImages &&
                  product.additionalImages.length > 0 && (
                    <div className="mt-6 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      {[product.displayImage, ...product.additionalImages].map(
                        (img, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveImage(img)}
                            className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
                              activeImage === img
                                ? "ring-3 ring-[var(--color-green)] shadow-lg"
                                : "ring-1 ring-gray-200 hover:ring-2 hover:ring-[var(--color-green)]/50"
                            }`}
                            style={{
                              width: "80px",
                              height: "80px",
                              flexShrink: 0,
                            }}
                            aria-label={`View image ${index + 1} of ${
                              product.displayTitle
                            }`}
                          >
                            <Image
                              src={img}
                              alt={`${product.displayTitle} thumbnail ${
                                index + 1
                              }`}
                              fill
                              sizes="80px"
                              style={{ objectFit: "cover" }}
                              quality={80}
                            />
                          </motion.button>
                        )
                      )}
                    </div>
                  )}
              </section>

              {/* Product Information Section */}
              <section
                className="p-6 lg:p-8 flex flex-col justify-between"
                aria-label="Product Information"
              >
                <div>
                  {/* Header */}
                  <header className="flex justify-between items-start mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span
                          className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-green)] bg-green-50 px-3 py-1 rounded-full"
                          itemProp="category"
                        >
                          <Package className="h-3 w-3" />
                          {product.group || "Product"}
                        </span>
                      </div>

                      <h1
                        className="text-3xl lg:text-4xl font-bold text-[var(--color-black)] mb-4 leading-tight"
                        itemProp="name"
                      >
                        {product.displayTitle}
                      </h1>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                          <span className="text-gray-600 font-medium text-xl">
                            Premium Quality
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Share Button */}
                    <div className="relative" ref={shareMenuRef}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-xl font-medium hover:bg-gray-100 transition-colors shadow-sm"
                        aria-label="Share product"
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="text-sm">Share</span>
                      </motion.button>

                      <AnimatePresence>
                        {isShareMenuOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border z-50 overflow-hidden"
                          >
                            <div className="p-2">
                              {[
                                {
                                  icon: Copy,
                                  label: "Copy Link",
                                  action: copyLinkToClipboard,
                                },
                                {
                                  icon: Mail,
                                  label: "Email",
                                  action: shareViaEmail,
                                },
                                {
                                  icon: Facebook,
                                  label: "Facebook",
                                  action: () => shareToSocialMedia("facebook"),
                                },
                                {
                                  icon: Send,
                                  label: "WhatsApp",
                                  action: () => shareToSocialMedia("whatsapp"),
                                },
                              ].map((item, idx) => (
                                <button
                                  key={idx}
                                  onClick={item.action}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                  <item.icon className="h-4 w-4" />
                                  {item.label}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </header>

                  {/* Product Name/Subtitle */}
                  {product.name && product.name !== product.displayTitle && (
                    <p
                      className="text-lg text-gray-600 mb-6 font-medium"
                      itemProp="model"
                    >
                      {product.name}
                    </p>
                  )}

                  {/* Basic Description */}
                  {product.description && (
                    <div className="mb-8" itemProp="description">
                      <h2 className="text-xl font-semibold text-[var(--color-black)] mb-3 flex items-center gap-2">
                        <Info className="h-5 w-5 text-[var(--color-green)]" />
                        About This Product
                      </h2>
                      <div className="prose prose-gray max-w-none">
                        <p className="text-gray-700 leading-relaxed text-lg">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications &&
                    Array.isArray(product.specifications) &&
                    product.specifications.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-base font-semibold text-[var(--color-black)] mb-4 flex items-center gap-2">
                          <Package className="h-5 w-5 text-[var(--color-green)]" />
                          Specifications
                        </h2>
                        <div className="bg-gray-50 rounded-xl p-6 uppercase text-sm">
                          <dl className="grid grid-cols-1 gap-4">
                            {product.specifications.map((spec, index) => (
                              <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200 last:border-0"
                                itemProp="additionalProperty"
                                itemScope
                                itemType="https://schema.org/PropertyValue"
                              >
                                <dt
                                  className="font-medium text-gray-900 mb-1 sm:mb-0"
                                  itemProp="name"
                                >
                                  {spec.title}
                                </dt>
                                <dd
                                  className="text-gray-700 sm:text-right"
                                  itemProp="value"
                                >
                                  {spec.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    )}

                  {/* SEO Keywords */}
                  {product.seoKeywords && (
                    <div className="mb-8">
                      <div className="flex flex-wrap gap-2">
                        {product.seoKeywords.split(",").map((keyword, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center antialiased text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            {keyword.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-6 pt-6 border-t border-gray-100">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {product.video && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={product.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-[var(--color-green)] rounded-xl font-medium hover:bg-gray-100 transition-all shadow-sm"
                        aria-label="Watch product video"
                      >
                        <Play className="h-5 w-5" />
                        <span className="hidden sm:inline">Watch Video</span>
                        <span className="sm:hidden">Video</span>
                      </motion.a>
                    )}
                    {product.pdf && (
                      <motion.a
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        href={product.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 text-[var(--color-green)] rounded-xl font-medium hover:bg-gray-100 transition-all shadow-sm"
                        aria-label="Download product PDF"
                      >
                        <Download className="h-5 w-5" />
                        <span className="hidden sm:inline">Download PDF</span>
                        <span className="sm:hidden">PDF</span>
                      </motion.a>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowInterestForm(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-green)] text-white rounded-xl font-medium hover:bg-green-600 transition-all shadow-md col-span-1 sm:col-span-1"
                    >
                      I'm Interested
                    </motion.button>
                  </div>

                  {/* Interest Form */}
                  <AnimatePresence>
                    {showInterestForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 shadow-inner"
                      >
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">
                          Get in Touch
                        </h3>
                        <form className="space-y-4">
                          {Array.from(
                            new Map(
                              [
                                ...defaultQueries,
                                ...(product.queries || []),
                              ].map((query) => [query.title, query])
                            ).values()
                          ).map((query, idx) => (
                            <div key={idx}>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {query.title}
                                {(query.title === "Name" ||
                                  query.title === "Phone Number") && (
                                  <span className="text-red-500 ml-1">*</span>
                                )}
                              </label>
                              <input
                                type={
                                  query.type === "number" ? "number" : "text"
                                }
                                value={queryValues[query.title] || ""}
                                onChange={(e) =>
                                  handleQueryChange(query.title, e.target.value)
                                }
                                className="w-full p-3 border text-base border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all"
                                placeholder={`Enter ${query.title.toLowerCase()}`}
                                required={
                                  query.title === "Name" ||
                                  query.title === "Phone Number"
                                }
                                disabled={isSubmitting}
                              />
                            </div>
                          ))}
                          <div className="flex gap-3 pt-2">
                            <button
                              type="button"
                              onClick={submitInterest}
                              disabled={isSubmitting}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-green)] text-white rounded-lg font-medium disabled:opacity-50 text-base disabled:cursor-not-allowed hover:bg-green-600 transition-all"
                            >
                              {isSubmitting ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    ease: "linear",
                                  }}
                                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                />
                              ) : (
                                "Submit Inquiry"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowInterestForm(false)}
                              disabled={isSubmitting}
                              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}

                    {showThankYou && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6 text-center shadow-sm"
                      >
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full mx-auto mb-4">
                          ✓
                        </div>
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          Thank You for Your Interest!
                        </h3>
                        <p className="text-green-700 text-lg">
                          We've received your inquiry and will contact you soon
                          with more information.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </div>
          </motion.article>

          {/* Custom Sections - Enhanced Layout */}
          {product.customSections && product.customSections.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-12"
              aria-label="Detailed Product Information"
            >
              <h2 className="text-3xl font-bold text-[var(--color-black)] mb-8 text-center">
                Detailed Information
              </h2>

              <div className="space-y-6">
                {product.customSections.map((section, index) => (
                  <motion.article
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleSection(index)}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] "
                      aria-expanded={expandedSections[index]}
                      aria-controls={`section-${index}`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-[var(--color-black)] pr-4">
                          {section.title}
                        </h3>
                        <motion.div
                          animate={{
                            rotate: expandedSections[index] ? 180 : 0,
                          }}
                          transition={{ duration: 0.2 }}
                          className="flex-shrink-0"
                        >
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        </motion.div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedSections[index] && (
                        <motion.div
                          id={`section-${index}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 border-t border-gray-100">
                            <div className="prose prose-lg max-w-none text-lg text-gray-700 mt-4">
                              <ReactMarkdown
  remarkPlugins={[remarkGfm]} 
  rehypePlugins={[rehypeSanitize]}
  components={{
    p: ({ node, ...props }) => (
      <p className="text-gray-700 mb-2" {...props} />
    ),
    h1: ({ node, ...props }) => (
      <h1 className="text-2xl font-bold text-gray-800 mt-6 mb-3" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <h2 className="text-xl font-semibold text-gray-800 mt-5 mb-2" {...props} />
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside text-gray-700 mb-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside text-gray-700 mb-2" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-gray-700 mb-1" {...props} />
    ),
    a: ({ node, ...props }) => (
      <a className="text-[var(--color-green)] hover:underline" {...props} />
    ),
    // Table styling components
    table: ({ node, ...props }) => (
      <table className="min-w-full border-collapse border border-gray-300 mt-4 mb-4 text-sm" {...props} />
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-gray-50" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-left text-gray-800" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="border border-gray-300 px-3 py-2 text-gray-700" {...props} />
    ),
    tr: ({ node, ...props }) => (
      <tr className="hover:bg-gray-50" {...props} />
    ),
    // Code styling
    code: ({ node, ...props }) => {
      const isInline = !props.className?.includes('language-');
      return isInline ? (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" {...props} />
      ) : (
        <code className="block bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto" {...props} />
      );
    },
    pre: ({ node, ...props }) => (
      <pre className="bg-gray-100 p-3 rounded text-sm font-mono text-gray-800 overflow-x-auto mb-4" {...props} />
    ),
    // Blockquote styling
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4" {...props} />
    ),
    // Strong and emphasis
    strong: ({ node, ...props }) => (
      <strong className="font-semibold text-gray-800" {...props} />
    ),
    em: ({ node, ...props }) => (
      <em className="italic text-gray-700" {...props} />
    ),
  }}
>
  {watch(`customSections.${index}.content`) || "Enter Markdown to see preview"}
</ReactMarkdown>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          {/* Related Products Section */}
          {interestingProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-16"
              aria-label="Related Products"
            >
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[var(--color-black)] mb-4">
                  You Might Also Like
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Explore our other premium products that complement your
                  interests
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {interestingProducts.map((interestingProduct, index) => (
                  <motion.article
                    key={index}
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
                    itemScope
                    itemType="https://schema.org/Product"
                  >
                    <Link
                      href={`/products/${createSlug(
                        interestingProduct.name
                      )}?id=${interestingProduct._id}`}
                      className="block"
                    >
                      <div
                        className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden"
                        style={{ height: "200px" }}
                      >
                        <Image
                          src={
                            interestingProduct.displayImage ||
                            "/no-image-placeholder.png"
                          }
                          alt={`${interestingProduct.displayTitle} - Product image`}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                          style={{
                            objectFit: "contain",
                            backgroundColor: "#f9f9f9",
                          }}
                          quality={80}
                          className="group-hover:scale-110 transition-transform duration-300"
                          itemProp="image"
                        />

                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3">
                            <Eye className="h-5 w-5 text-[var(--color-green)]" />
                          </div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-[var(--color-green)] bg-green-50 px-2 py-1 rounded-full">
                            {interestingProduct.group || "Product"}
                          </span>
                        </div>

                        <h3
                          className="text-lg font-semibold text-[var(--color-black)] mb-2 line-clamp-2 group-hover:text-[var(--color-green)] transition-colors"
                          itemProp="name"
                        >
                          {interestingProduct.displayTitle}
                        </h3>

                        {interestingProduct.name &&
                          interestingProduct.name !==
                            interestingProduct.displayTitle && (
                            <p
                              className="text-sm text-gray-600 line-clamp-1 mb-3"
                              itemProp="model"
                            >
                              {interestingProduct.name}
                            </p>
                          )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-gray-500">
                              Premium
                            </span>
                          </div>

                          <motion.div
                            className="text-[var(--color-green)] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            whileHover={{ x: 5 }}
                          >
                            <span className="text-sm font-medium">
                              View Details →
                            </span>
                          </motion.div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </motion.section>
          )}

          {/* Additional SEO Content */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-16 bg-white rounded-2xl shadow-lg p-8"
            aria-label="Additional Information"
          >
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-[var(--color-black)] mb-4">
                Why Choose Our Products?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                {[
                  {
                    icon: "✨",
                    title: "Premium Quality",
                    description:
                      "All our products meet the highest quality standards and undergo rigorous testing.",
                  },
                  {
                    icon: "🚀",
                    title: "Fast Delivery",
                    description:
                      "Quick and reliable delivery service to get your products when you need them.",
                  },
                  {
                    icon: "🛡️",
                    title: "Warranty Included",
                    description:
                      "Comprehensive warranty coverage for peace of mind with every purchase.",
                  },
                ].map((feature, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-lg font-semibold text-[var(--color-black)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      {/* Structured Data for FAQ if custom sections exist */}
      {product.customSections && product.customSections.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: product.customSections.map((section) => ({
                "@type": "Question",
                name: section.title,
                acceptedAnswer: {
                  "@type": "Answer",
                  text:
                    section.content.replace(/[#*]/g, "").substring(0, 500) +
                    "...",
                },
              })),
            }),
          }}
        />
      )}
    </>
  );
}
