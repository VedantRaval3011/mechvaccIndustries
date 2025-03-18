// app/products/[slug]/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Product } from "@/types/product";
import { 
  ChevronLeft, 
  Star, 
  Download, 
  Play, 
  Share2, 
  Copy, 
  Mail, 
  Facebook,  
  Send 
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Head from "next/head";
import { use } from "react";
import toast, { Toaster } from "react-hot-toast";

interface ExtendedProduct extends Product {
  _id: string;
  slug: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const [product, setProduct] = useState<ExtendedProduct | null>(null);
  const [interestingProducts, setInterestingProducts] = useState<ExtendedProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeImage, setActiveImage] = useState<string>("");
  const [isShareMenuOpen, setIsShareMenuOpen] = useState<boolean>(false);
  const [isInterestingLoading, setIsInterestingLoading] = useState<boolean>(false);
  const [showInterestForm, setShowInterestForm] = useState<boolean>(false);
  const [queryValues, setQueryValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
  const [defaultQueries] = useState([
    { title: 'Name', type: 'string' },
    { title: 'Phone Number', type: 'string' },
  ]);
  
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        setProduct(data as ExtendedProduct);
        setActiveImage(data.displayImage || "");
        fetchInterestingProducts();
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [slug]);

  const fetchInterestingProducts = async () => {
    setIsInterestingLoading(true);
    try {
      const res = await fetch(`/api/products?featured=true&limit=4`);
      if (!res.ok) throw new Error("Failed to fetch interesting products");
      const data = await res.json();
      const productsArray = Array.isArray(data) ? data : [];
      setInterestingProducts(productsArray.slice(0, 4) as ExtendedProduct[]);
    } catch (error) {
      console.error("Error fetching interesting products:", error);
    } finally {
      setIsInterestingLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyLinkToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    setIsShareMenuOpen(false);
  };

  const shareViaEmail = () => {
    if (!product) return;
    const subject = encodeURIComponent(`Check out this product: ${product.displayTitle}`);
    const body = encodeURIComponent(
      `I found this amazing product:\n\n${product.displayTitle}\n\n${window.location.href}\n\nPrice: ₹${product.price}\n\n${product.name}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setIsShareMenuOpen(false);
  };

  const shareToSocialMedia = (platform: "facebook" | "whatsapp") => {
    if (!product) return;
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(`Check out this product: ${product.displayTitle}`);
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
    setQueryValues(prev => ({
      ...prev,
      [queryTitle]: value,
    }));
  };

  const submitInterest = async () => {
    if (!product) return;
    
    try {
      setIsSubmitting(true);
      // Filter out duplicates by creating a Map and converting back to array
      const allQueries = [...defaultQueries, ...(product.queries || [])];
      const uniqueQueries = Array.from(
        new Map(allQueries.map(query => [query.title, query])).values()
      );
      const queriesWithValues = uniqueQueries.map(query => ({
        ...query,
        value: queryValues[query.title] || '',
      }));

      const updateResponse = await fetch(`/api/products/step3/${product._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries: queriesWithValues }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update product queries');
      }

      const emailResponse = await fetch('/api/send-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product._id,
          productTitle: product.displayTitle,
          userQueries: queriesWithValues,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      setShowInterestForm(false);
      setShowThankYou(true);
      setQueryValues({});
      setTimeout(() => setShowThankYou(false), 5000);
    } catch (error) {
      console.error('Error submitting interest:', error);
      toast.error('Failed to submit interest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-gray-bg)]">
        <motion.div 
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <motion.div 
            className="absolute inset-0 border-4 border-t-[var(--color-green)] border-r-transparent border-b-transparent border-l-transparent rounded-full"
          />
        </motion.div>
        <motion.p 
          className="mt-6 text-xl font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Loading Product Details...
        </motion.p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-gray-bg)]">
        <motion.div 
          className="text-center bg-white p-8 rounded-2xl shadow-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Product Not Found</h2>
          <Link href="/products">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-[var(--color-green)] text-white rounded-xl font-medium"
            >
              Back to Products
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  const pageTitle = `${product.displayTitle} - ${product.group || "Product"}`;
  const metaDescription = `${product.description} - High-quality ${product.group || "product"} priced at $${product.price || "N/A"}.`;
  const canonicalUrl = `https://yourdomain.com/products/${slug}`;
  const keywords = product.seoKeywords || `${product.displayTitle}, ${product.group}, buy online`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <meta name="robots" content="index, follow" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={product.displayImage || "/default-image.jpg"} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:price:amount" content={product.price?.toString() || ""} />
        <meta property="og:price:currency" content="INR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={product.displayImage || "/default-image.jpg"} />
      </Head>

      <Toaster position="top-center" />

      <div className="min-h-screen bg-[var(--color-gray-bg)] py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Link href="/products">
              <motion.button
                whileHover={{ x: -5 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-[var(--color-green)] font-medium hover:underline"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Products
              </motion.button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6">
                {/* Main product image - updated for better quality */}
                <motion.div
                  className="relative rounded-xl overflow-hidden bg-gray-100"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  style={{ width: '100%', height: '500px' }}
                >
                  <Image
                    src={activeImage || "/no-image-placeholder.png"}
                    alt={product.displayTitle}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                    style={{ 
                      objectFit: 'contain',
                      backgroundColor: '#f9f9f9'
                    }}
                    quality={100}
                  />
                  {product.price && (
                    <motion.div 
                      className="absolute top-4 right-4 bg-[var(--color-green)] text-white py-2 px-4 rounded-full font-bold shadow-md"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      ${product.price}{product.priceLabel ? ` (${product.priceLabel})` : ""}
                    </motion.div>
                  )}
                </motion.div>

                {/* Thumbnail images - updated for consistency */}
                {product.additionalImages && product.additionalImages.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                    {[product.displayImage, ...product.additionalImages].map((img, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveImage(img)}
                        className={`relative cursor-pointer rounded-lg overflow-hidden ${
                          activeImage === img ? "ring-2 ring-[var(--color-green)]" : ""
                        }`}
                        style={{ width: '80px', height: '80px', flexShrink: 0 }}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${index}`}
                          fill
                          sizes="80px"
                          style={{ objectFit: 'cover' }}
                          quality={80}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-sm font-medium text-[var(--color-green)] mb-2">
                      {product.group || "Uncategorized"}
                    </p>
                    <div className="relative" ref={shareMenuRef}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
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
                            className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg z-50 overflow-hidden"
                          >
                            <div className="p-2">
                              <button
                                onClick={copyLinkToClipboard}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                              >
                                <Copy className="h-4 w-4" />
                                Copy Link
                              </button>
                              <button
                                onClick={shareViaEmail}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                              >
                                <Mail className="h-4 w-4" />
                                Email
                              </button>
                              <button
                                onClick={() => shareToSocialMedia("facebook")}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                              >
                                <Facebook className="h-4 w-4" />
                                Facebook
                              </button>
                              <button
                                onClick={() => shareToSocialMedia("whatsapp")}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                              >
                                <Send className="h-4 w-4" />
                                WhatsApp
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-[var(--color-black)] mb-3">
                    {product.displayTitle}
                  </h1>
                  <div className="flex items-center gap-2 mb-4">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="text-gray-600">Premium Product</span>
                  </div>
                  <p className="text-gray-600 mb-6">{product.name}</p>
                  {product.description && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-[var(--color-black)] mb-2">
                        Description
                      </h3>
                      <p className="text-gray-600">{product.description}</p>
                    </div>
                  )}

                  {product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-[var(--color-black)] mb-3">
                        Specifications
                      </h3>
                      <ul className="space-y-2">
                        {product.specifications.map((spec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="text-[var(--color-green)]">•</span>
                            <span className="text-gray-700">
                              <strong>{spec.title}:</strong> {spec.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {product.seoKeywords && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {product.seoKeywords.split(',').map((keyword, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                        >
                          {keyword.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 flex-wrap">
                    {product.video && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={product.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-[var(--color-green)] rounded-xl font-medium hover:bg-gray-200"
                      >
                        <Play className="h-5 w-5" />
                        Watch Video
                      </motion.a>
                    )}
                    {product.pdf && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={product.pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-[var(--color-green)] rounded-xl font-medium hover:bg-gray-200"
                      >
                        <Download className="h-5 w-5" />
                        Download PDF
                      </motion.a>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowInterestForm(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--color-green)] text-white rounded-xl font-medium hover:bg-green-600"
                    >
                      I&apos;m Interested
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showInterestForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-gray-50 rounded-xl relative"
                      >
                        {Array.from(
                          new Map([...defaultQueries, ...(product.queries || [])].map(query => [query.title, query])).values()
                        ).map((query, idx) => (
                          <div key={idx} className="mb-3">
                            <label className="block text-sm font-medium mb-1">
                              {query.title}
                            </label>
                            <input
                              type={query.type === 'number' ? 'number' : 'text'}
                              value={queryValues[query.title] || ''}
                              onChange={(e) => handleQueryChange(query.title, e.target.value)}
                              className="w-full p-2 border rounded-md"
                              placeholder={`Enter ${query.title}`}
                              required={query.title === 'Name' || query.title === 'Phone Number'}
                              disabled={isSubmitting}
                            />
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <button
                            onClick={submitInterest}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-[var(--color-green)] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <motion.span
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                              />
                            ) : (
                              'Submit'
                            )}
                          </button>
                          <button
                            onClick={() => setShowInterestForm(false)}
                            disabled={isSubmitting}
                            className="flex-1 px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                    {showThankYou && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center"
                      >
                        <h3 className="text-lg font-semibold text-green-700">
                          Thank You for Reaching Out!
                        </h3>
                        <p className="text-green-600">
                          We will contact you soon.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {interestingProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-[var(--color-black)] mb-6">
                Our Interesting Products
              </h2>
              
              {isInterestingLoading ? (
                <p className="text-gray-600">Loading interesting products...</p>
              ) : interestingProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {interestingProducts.map((interestingProduct, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -5, scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <Link href={`/products/${interestingProduct._id}`}>
                        {/* Updated related product images */}
                        <div className="relative bg-gray-100" style={{ height: '200px' }}>
                          <Image
                            src={interestingProduct.displayImage || "/no-image-placeholder.png"}
                            alt={`Image of ${interestingProduct.displayTitle}`}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            style={{ 
                              objectFit: 'contain',
                              backgroundColor: '#f9f9f9'
                            }}
                            quality={80}
                          />
                        </div>
                        <div className="p-4">
                          <p className="text-xs font-medium text-[var(--color-green)] mb-1">
                            {interestingProduct.group}
                          </p>
                          <h3 className="text-lg font-semibold text-[var(--color-black)] mb-2 line-clamp-1">
                            {interestingProduct.displayTitle}
                          </h3>
                          {interestingProduct.price && (
                            <p className="text-sm font-bold text-[var(--color-green)]">
                            ${interestingProduct.price}
                            {interestingProduct.priceLabel ? ` (${interestingProduct.priceLabel})` : ""}
                          </p>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No interesting products available at the moment.</p>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}