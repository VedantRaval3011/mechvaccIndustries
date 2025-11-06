"use client";
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

// Lazy load framer-motion components
const MotionDiv = lazy(() => 
  import("framer-motion").then(module => ({ 
    default: module.motion.div 
  }))
);
const AnimatePresence = lazy(() => 
  import("framer-motion").then(module => ({ 
    default: module.AnimatePresence 
  }))
);

// Cache for products data
class ProductsCache {
  private static instance: ProductsCache;
  private cache: Map<string, { data: Product[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ProductsCache {
    if (!ProductsCache.instance) {
      ProductsCache.instance = new ProductsCache();
    }
    return ProductsCache.instance;
  }

  get(key: string): Product[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  set(key: string, data: Product[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

// Function to convert product name to URL slug
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Memoized Product Card component
const ProductCard = React.memo(({
  item,
  layout,
  direction,
  windowWidth,
  visibleCount,
  isAnimatingRef,
}: {
  item: Product;
  layout: {
    position: number;
    isEntering: boolean;
    isExiting: boolean;
  };
  direction: number;
  windowWidth: number;
  visibleCount: number;
  isAnimatingRef: React.MutableRefObject<boolean>;
}) => {
  const isCentered = layout.position === Math.floor(visibleCount / 2);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? windowWidth / visibleCount : -windowWidth / visibleCount,
      opacity: 0,
      scale: 0.9,
      zIndex: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      scale: isCentered ? 1.08 : 1,
      zIndex: isCentered ? 2 : 1,
      transition: {
        duration: 0.4,
      },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? windowWidth / visibleCount : -windowWidth / visibleCount,
      opacity: 0,
      scale: 0.9,
      zIndex: 0,
      transition: {
        duration: 0.4,
      },
    }),
  };

  const keywords = React.useMemo(() => {
    return item.seoKeywords
      ? item.seoKeywords
          .split(",")
          .map((k) => k.trim())
          .slice(0, 3)
      : ["HDPE Tank", "Chemical Storage", "Spiral Tank"];
  }, [item.seoKeywords]);

  return (
    <Suspense fallback={
      <div 
        className="absolute top-0 w-full md:w-[46%] lg:w-[30%] px-4"
        style={{ left: `${layout.position * (100 / visibleCount)}%` }}
      >
        <ProductCardSkeleton />
      </div>
    }>
      <MotionDiv
        className="absolute top-0 w-full md:w-[46%] lg:w-[30%] px-4"
        style={{
          left: `${layout.position * (100 / visibleCount)}%`,
        }}
        custom={direction}
        variants={variants}
        initial={layout.isEntering ? "enter" : false}
        animate="visible"
        exit={layout.isExiting ? "exit" : undefined}
        key={item._id}
        onAnimationComplete={() => {
          if (layout.isExiting) {
            isAnimatingRef.current = false;
          }
        }}
      >
        <Link
          href={`/products/${createSlug(item.name)}`}
          className="w-full block"
          prefetch={false} // Disable prefetching for better performance
        >
          <div className="group relative flex flex-col items-center rounded-3xl shadow-lg h-[28rem] w-full bg-white cursor-pointer border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--color-green)] transform origin-right transition-transform duration-300 ease-in-out scale-x-0 group-hover:scale-x-100 z-10"></div>

            <div className="relative w-full h-56 z-20">
              <Image
                src={item.displayImage}
                width={285}
                height={500}
                alt={item.displayTitle}
                className="h-56 w-full object-cover rounded-t-3xl"
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="flex flex-col flex-1 w-full p-5 pb-6 bg-white z-20 relative group-hover:bg-transparent transition-colors duration-300">
              <div className="flex flex-col space-y-2 flex-1">
                <div>
                  <p className="text-sm font-medium text-gray-500 group-hover:text-white transition-colors duration-300 truncate">
                    {item.group || "Uncategorized"}
                  </p>
                  <h2 className="text-xl font-semibold uppercase line-clamp-2 group-hover:text-white transition-colors duration-300">
                    {item.displayTitle}
                  </h2>
                </div>
                <div className="text-sm group-hover:text-white transition-colors duration-300 flex-1">
                  <div className="mb-2">
                    <div className="flex flex-wrap gap-1 mt-1">
                      {keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 group-hover:bg-white/20 px-2 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <p className="text-[var(--color-green)] font-medium flex items-center cursor-pointer hover:underline group-hover:text-white transition-colors duration-300">
                    Know More <ArrowRight size={16} className="ml-1" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </MotionDiv>
    </Suspense>
  );
});

ProductCard.displayName = 'ProductCard';

// Optimized skeleton component
const ProductCardSkeleton = React.memo(() => (
  <div className="flex flex-col items-center rounded-3xl shadow-lg h-[28rem] w-full bg-gray-200 animate-pulse">
    <div className="w-full h-56 bg-gray-300 rounded-t-3xl"></div>
    <div className="flex flex-col flex-1 w-full p-5 pb-6">
      <div className="flex flex-col space-y-2 flex-1">
        <div className="h-4 w-1/3 bg-gray-300 rounded"></div>
        <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
        <div className="flex flex-wrap gap-1 mt-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-16 bg-gray-300 rounded-full"></div>
          ))}
        </div>
      </div>
      <div className="mt-auto">
        <div className="h-4 w-24 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
));

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const [direction, setDirection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMotionLoaded, setIsMotionLoaded] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const cache = ProductsCache.getInstance();

  // Optimized fetch with caching
  const fetchProducts = React.useCallback(async () => {
    try {
      // Check cache first
      const cachedProducts = cache.get('featured-products');
      if (cachedProducts) {
        setFeaturedProducts(cachedProducts);
        setLoading(false);
        return;
      }

      const response = await fetch("/api/products", {
        // Add cache headers for browser caching
        headers: {
          'Cache-Control': 'public, max-age=300', // 5 minutes
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Product[] = await response.json();
      
      // Cache the results
      cache.set('featured-products', data);
      setFeaturedProducts(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setFeaturedProducts([]);
      setLoading(false);
    }
  }, [cache]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();

    // Set initial window width
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);

      const handleResize = () => {
        setWindowWidth(window.innerWidth);
      };

      window.addEventListener("resize", handleResize, { passive: true });
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [fetchProducts]);

  // Preload framer-motion after initial render
  useEffect(() => {
    const preloadMotion = async () => {
      try {
        await Promise.all([
          import("framer-motion"),
        ]);
        setIsMotionLoaded(true);
      } catch (error) {
        console.error("Failed to preload framer-motion:", error);
        setIsMotionLoaded(true); // Still set to true to prevent infinite loading
      }
    };

    // Delay loading slightly to prioritize initial render
    const timer = setTimeout(preloadMotion, 100);
    return () => clearTimeout(timer);
  }, []);

  // Reset animation state when page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        isAnimatingRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange, { passive: true });
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Memoized items calculation
  const visibleCount = React.useMemo(() => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  }, [windowWidth]);

  // Auto-slide with optimization
  useEffect(() => {
    if (featuredProducts.length === 0 || loading || !isMotionLoaded) return;

    const interval = setInterval(() => {
      if (!document.hidden && !isAnimatingRef.current) {
        handleNextSlide();
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [featuredProducts, activeIndex, loading, isMotionLoaded]);

  const handleNextSlide = React.useCallback(() => {
    if (featuredProducts.length <= visibleCount || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % featuredProducts.length);

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 500);
  }, [featuredProducts.length, visibleCount]);

  const handlePrevSlide = React.useCallback(() => {
    if (featuredProducts.length <= visibleCount || isAnimatingRef.current) return;

    isAnimatingRef.current = true;
    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
    );

    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 500);
  }, [featuredProducts.length, visibleCount]);

  // Skeleton loading component for products
  const ProductSkeleton = React.useMemo(() => {
    const skeletonCount = visibleCount;
    return (
      <div className="relative w-full min-h-[28rem]">
        {[...Array(skeletonCount)].map((_, idx) => (
          <div
            key={idx}
            className="absolute top-0 w-full md:w-[46%] lg:w-[30%] px-4"
            style={{
              left: `${idx * (100 / skeletonCount)}%`,
            }}
          >
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    );
  }, [visibleCount]);

  // Memoized visible products calculation
  const getVisibleProductsWithLayout = React.useCallback(() => {
    if (!featuredProducts.length) return [];

    const result = [];
    const totalCount = featuredProducts.length;

    if (direction !== 0) {
      const prevIndex =
        direction > 0
          ? (activeIndex - 1 + totalCount) % totalCount
          : (activeIndex + visibleCount) % totalCount;

      result.push({
        product: featuredProducts[direction > 0 ? prevIndex : prevIndex],
        layout: {
          position: direction > 0 ? 0 : visibleCount - 1,
          isEntering: false,
          isExiting: true,
        },
      });
    }

    for (let i = 0; i < Math.min(visibleCount, totalCount); i++) {
      const index = (activeIndex + i) % totalCount;
      result.push({
        product: featuredProducts[index],
        layout: {
          position: i,
          isEntering: false,
          isExiting: false,
        },
      });
    }

    if (direction !== 0) {
      const enteringIndex =
        direction > 0
          ? (activeIndex + visibleCount) % totalCount
          : (activeIndex - 1 + totalCount) % totalCount;

      result.push({
        product: featuredProducts[enteringIndex],
        layout: {
          position: direction > 0 ? visibleCount - 1 : 0,
          isEntering: true,
          isExiting: false,
        },
      });
    }

    return result;
  }, [featuredProducts, activeIndex, direction, visibleCount]);

  const visibleProducts = React.useMemo(() => getVisibleProductsWithLayout(), [getVisibleProductsWithLayout]);

  if (loading || !isMotionLoaded) {
    return (
      <div className="container px-4 pb-10 sm:px-6 flex flex-col items-center mt-5 mx-auto mb-5 xl:mb-24 overflow-hidden">
        <div className="text-2xl md:text-4xl lg:text-5xl font-semibold text-center flex items-center flex-col">
          <h1>
            OUR EXPORT-APPROVED <br />
            <span className="relative text-3xl md:text-5xl lg:text-7xl">
              PRODUCTS{" "}
              <span className="absolute left-[2px] text-[var(--color-green)]">
                PRODUCTS
              </span>
            </span>
          </h1>
        </div>
        <Link href="/products">
          <button className="bg-[var(--color-green)] lg:text-2xl text-white text-2xl rounded-2xl cursor-pointer text-center p-2.5 mt-2">
            All Products
          </button>
        </Link>
        {ProductSkeleton}
      </div>
    );
  }

  if (!featuredProducts.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-7xl min-h-[28rem] items-center justify-center">
        <div>No products available.</div>
      </div>
    );
  }

  return (
    <div className="container px-4 pb-10 sm:px-6 flex flex-col items-center mt-5 mx-auto mb-5 xl:mb-24 overflow-hidden">
      <div className="text-2xl md:text-4xl lg:text-5xl font-semibold text-center flex items-center flex-col">
        <h1>
          OUR EXPORT-APPROVED <br />
          <span className="relative text-3xl md:text-5xl lg:text-7xl">
            PRODUCTS{" "}
            <span className="absolute left-[2px] text-[var(--color-green)]">
              PRODUCTS
            </span>
          </span>
        </h1>
      </div>

      <Link href="/products">
        <button className="bg-[var(--color-green)] lg:text-2xl text-white text-2xl rounded-2xl cursor-pointer text-center p-2.5 mt-2">
          All Products
        </button>
      </Link>

      <div className="flex items-center gap-4 mt-4 mb-10">
        <button
          onClick={handlePrevSlide}
          className="bg-white text-green cursor-pointer rounded-full shadow-lg hover:text-[var(--color-green)] hover:scale-105 p-2 transition-all duration-300"
          disabled={featuredProducts.length <= visibleCount}
          aria-label="Previous products"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleNextSlide}
          className="bg-white text-green cursor-pointer rounded-full shadow-lg hover:text-[var(--color-green)] hover:scale-105 p-2 transition-all duration-300"
          disabled={featuredProducts.length <= visibleCount}
          aria-label="Next products"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      <div className="relative w-full max-w-7xl">
        <div ref={carouselRef} className="relative w-full min-h-[28rem]">
          <Suspense fallback={ProductSkeleton}>
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {visibleProducts.map((item) => (
                <ProductCard
                  key={`${item.product._id}-${item.layout.position}-${
                    item.layout.isEntering
                      ? "entering"
                      : item.layout.isExiting
                      ? "exiting"
                      : "visible"
                  }`}
                  item={item.product}
                  layout={item.layout}
                  direction={direction}
                  windowWidth={windowWidth}
                  visibleCount={visibleCount}
                  isAnimatingRef={isAnimatingRef}
                />
              ))}
            </AnimatePresence>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;