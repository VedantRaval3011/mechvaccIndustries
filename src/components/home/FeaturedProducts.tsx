"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";

const FeaturedProducts = () => {
  const [startIndex, setStartIndex] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

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
  }, []);

  const handleNextSlide = () => {
    setStartIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const handlePrevSlide = () => {
    setStartIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const getVisibleProducts = () => {
    if (!featuredProducts.length) return [];
    
    const itemsToShow = () => {
      const width = typeof window !== "undefined" ? window.innerWidth : 0;
      if (width < 768) return 1;
      if (width < 1024) return 2;
      if (width < 1280) return 3;
      return 4;
    };

    const count = itemsToShow();
    return Array.from(
      { length: count },
      (_, i) => featuredProducts[(startIndex + i) % featuredProducts.length]
    );
  };

  // Simplified slide animation
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  if (!featuredProducts.length) {
    return <div>Loading products...</div>;
  }

  const ProductCard = ({ item }: { item: Product }) => (
    <Link href={`/products/${item._id}`} className="w-full">
      <motion.div
        key={item._id}
        className="flex flex-col items-center rounded-3xl shadow-lg h-[28rem] w-full bg-white cursor-pointer hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden border border-gray-100"
        variants={slideVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="relative w-full h-56">
          <Image
            src={item.displayImage}
            width={285}
            height={500}
            alt={item.displayTitle}
            className="h-56 w-full object-cover rounded-t-3xl"
          />
        </div>
        
        <div className="flex flex-col flex-1 w-full p-5 pb-6 justify-between bg-white">
          <div className="flex flex-col space-y-3">
            <h2 className="text-xl font-semibold uppercase line-clamp-2">
              {item.displayTitle}
            </h2>
            <div className="flex items-center">
              <span className="text-base font-medium bg-green-50 text-[var(--color-green)] px-3 py-1 rounded-full">
                ₹ {item.price}
              </span>
              <span className="text-gray-600 ml-2 text-sm">
                ({item.priceLabel})
              </span>
            </div>
            <p className="text-gray-600 text-sm line-clamp-2">
              {item.description || "No description available"}
            </p>
            <div className="flex justify-between items-center mt-2">
              <p className="text-[var(--color-green)] font-medium flex items-center cursor-pointer hover:underline">
                Know More <ArrowRight size={16} className="ml-1" />
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );

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

      <button className="bg-[var(--color-green)] lg:text-2xl text-white text-2xl rounded-2xl cursor-pointer text-center p-2.5 mt-2">
        All Products
      </button>

      <div className="flex items-center gap-4 mt-4 mb-6">
        <button
          onClick={handlePrevSlide}
          className="bg-white text-green rounded-full shadow-lg hover:text-[var(--color-green)] hover:scale-105 p-2 transition-all duration-300"
        >
          <ArrowLeft size={24} />
        </button>
        <button
          onClick={handleNextSlide}
          className="bg-white text-green rounded-full shadow-lg hover:text-[var(--color-green)] hover:scale-105 p-2 transition-all duration-300"
        >
          <ArrowRight size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full max-w-7xl">
        {getVisibleProducts().map((item) => (
          <ProductCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;