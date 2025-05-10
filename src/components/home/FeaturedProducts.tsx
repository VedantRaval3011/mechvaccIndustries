"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [windowWidth, setWindowWidth] = useState(0);
  const [direction, setDirection] = useState(0);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data: Product[] = await response.json();
        setFeaturedProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setFeaturedProducts([]);
      }
    };

    fetchProducts();

    // Set initial window width
    setWindowWidth(window.innerWidth);

    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine number of items to show based on screen size
  const itemsToShow = () => {
    if (windowWidth < 768) return 1;
    if (windowWidth < 1024) return 2;
    return 3;
  };

  const visibleCount = itemsToShow();

  // This state represents the index of the first visible product
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (featuredProducts.length === 0) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredProducts, activeIndex]);

  const handleNextSlide = () => {
    if (featuredProducts.length <= visibleCount) return;

    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrevSlide = () => {
    if (featuredProducts.length <= visibleCount) return;

    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length
    );
  };

  const ProductCard = ({
    item,
    layout,
  }: {
    item: Product;
    layout: {
      position: number;
      isEntering: boolean;
      isExiting: boolean;
    };
  }) => {
    const isCentered = layout.position === Math.floor(visibleCount / 2);

    const variants = {
      enter: (direction: number) => ({
        x:
          direction > 0
            ? windowWidth / visibleCount
            : -windowWidth / visibleCount,
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
        x:
          direction < 0
            ? windowWidth / visibleCount
            : -windowWidth / visibleCount,
        opacity: 0,
        scale: 0.9,
        zIndex: 0,
        transition: {
          duration: 0.4,
        },
      }),
    };

    // Derive seoKeywords if empty
    const keywords = item.seoKeywords
      ? item.seoKeywords
          .split(",")
          .map((k) => k.trim())
          .slice(0, 3) // Limit to 3 keywords
      : ["HDPE Tank", "Chemical Storage", "Spiral Tank"]; // Fallback keywords

    return (
      <motion.div
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
      >
        <Link href={`/products/${item._id}`} className="w-full block">
          <div className="group relative flex flex-col items-center rounded-3xl shadow-lg h-[28rem] w-full bg-white cursor-pointer border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-[var(--color-green)] transform origin-right transition-transform duration-300 ease-in-out scale-x-0 group-hover:scale-x-100 z-10"></div>

            <div className="relative w-full h-56 z-20">
              <Image
                src={item.displayImage}
                width={285}
                height={500}
                alt={item.displayTitle}
                className="h-56 w-full object-cover rounded-t-3xl"
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

                {/* Features, Keywords, and First Know More Button */}
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

                {/* Second Know More Button */}
                <div className="mt-auto">
                  <p className="text-[var(--color-green)] font-medium flex items-center cursor-pointer hover:underline group-hover:text-white transition-colors duration-300">
                    Know More <ArrowRight size={16} className="ml-1" />
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };
  // Helper function to get visible product indices with their positions
  const getVisibleProductsWithLayout = () => {
    if (!featuredProducts.length) return [];

    const result = [];
    const totalCount = featuredProducts.length;

    // Calculate previous index for exit animation
    const prevIndex =
      direction > 0
        ? (activeIndex - 1 + totalCount) % totalCount
        : (activeIndex + visibleCount) % totalCount;

    // Add the card that's exiting (only during animations)
    if (direction !== 0) {
      result.push({
        product: featuredProducts[direction > 0 ? prevIndex : prevIndex],
        layout: {
          position: direction > 0 ? 0 : visibleCount - 1,
          isEntering: false,
          isExiting: true,
        },
      });
    }

    // Add the currently visible cards
    for (let i = 0; i < visibleCount; i++) {
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

    // Add the card that's entering (only during animations)
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
  };

  // Loading state with matching grid layout
  if (!featuredProducts.length) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-7xl min-h-[28rem] items-center justify-center">
        <div>Loading products...</div>
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
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleNextSlide}
          className="bg-white text-green cursor-pointer rounded-full shadow-lg hover:text-[var(--color-green)] hover:scale-105 p-2 transition-all duration-300"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      <div className="relative w-full max-w-7xl">
        <div className="relative w-full min-h-[28rem]">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            {getVisibleProductsWithLayout().map((item) => (
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
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
