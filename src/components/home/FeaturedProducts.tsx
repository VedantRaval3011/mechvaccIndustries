"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import Image from "next/image";

// Define the type for a product
interface Product {
  id: string;
  title: string;
  description: string;
  image: string; // URL of the image
}

// Dummy featured products array (since store is removed)
const featuredProducts: Product[] = [
  {
    id: "1",
    title: "Product 1",
    description: "High-quality product for industrial use.",
    image: "/demo-1.jpg",
  },
  {
    id: "2",
    title: "Product 2",
    description: "Reliable and efficient product for export.",
    image: "/demo-2.jpg",
  },
  {
    id: "3",
    title: "Product 3",
    description: "Durable and cost-effective product.",
    image: "/demo-3.jpg",
  },
  {
    id: "4",
    title: "Product 4",
    description: "Designed to meet industry standards.",
    image: "/demo-1.jpg",
  },
];

const FeaturedProducts = () => {
  const [startIndex, setStartIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(0); // 1 for next, -1 for prev

  // Handlers for navigation
  const handleNextSlide = () => {
    setDirection(1);
    setStartIndex((prevIndex) => (prevIndex + 1) % featuredProducts.length);
  };

  const handlePrevSlide = () => {
    setDirection(-1);
    setStartIndex(
      (prevIndex) =>
        (prevIndex - 1 + featuredProducts.length) % featuredProducts.length
    );
  };

  // Visible products for different screen sizes
  const visibleProducts: Product[] = [
    featuredProducts[startIndex],
    featuredProducts[(startIndex + 1) % featuredProducts.length],
    featuredProducts[(startIndex + 2) % featuredProducts.length],
  ];

  const visibleProductsInMobile: Product[] = [featuredProducts[startIndex]];
  const visibleProductsForDesktop: Product[] = [
    featuredProducts[startIndex],
    featuredProducts[(startIndex + 1) % featuredProducts.length],
    featuredProducts[(startIndex + 2) % featuredProducts.length],
    featuredProducts[(startIndex + 3) % featuredProducts.length],
  ];

  // Animation variants for sliding and scaling effect
  const slideVariants = {
    enter: (direction: number) => ({
      translateX: direction === 1 ? 300 : -300,
      opacity: 0,
      scale: 0.8,
    }),
    center: {
      translateX: 0,
      opacity: 1,
      scale: 1,
      zIndex: 1,
    },
    exit: (direction: number) => ({
      translateX: direction === 1 ? -300 : 300,
      opacity: 0,
      scale: 0.8,
      zIndex: 0,
    }),
  };

  return (
    <div className="container flex flex-col gap-4 items-center mt-5 mx-auto mb-10 xl:mb-24 3xl:mt-16 overflow-hidden">
      {/* Title Section */}
      <div className="text-2xl md:text-4xl lg:text-5xl font-semibold text-center flex items-center flex-col gap-2">
        <h1>
          OUR EXPORT-APPROVED <br />
          <span className="relative text-3xl md:text-5xl lg:text-7xl">
            PRODUCTS{" "}
            <span className="absolute left-[2px] text-green">PRODUCTS</span>
          </span>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrevSlide}
            className="bg-white cursor-pointer text-green rounded-full shadow-lg hover:bg-green hover:text-white"
          >
            <ArrowLeft size={30} />
          </button>
          <button
            onClick={handleNextSlide}
            className="bg-white cursor-pointer text-green rounded-full shadow-lg hover:bg-green hover:text-white"
          >
            <ArrowRight size={30} />
          </button>
        </div>
      </div>

      {/* Desktop/Tablet View */}
      <div className="flex items-center justify-center gap-[1.3rem] my-auto duration-700 ease-in-out overflow-hidden">
        {visibleProducts.map((item, i) => (
          <motion.div
            key={item.id}
            className="hidden md:flex xl:hidden flex-col items-center rounded-3xl shadow-lg h-[20rem] w-60"
            style={{ willChange: "transform, opacity" }}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Image
              src={item.image}
              width={285}
              height={500}
              alt={item.title}
              className="rounded-t-3xl h-56"
            />
            <div className="w-60 h-20 flex justify-around gap-6 items-center p-2 mt-6">
              <div>
                <h2 className="text-xl font-medium">{item.title}</h2>
                <p className="text-xs">{item.description}</p>
              </div>
              <Play
                size={40}
                className="mb-2 shadow-lg bg-grayBg rounded-3xl p-1"
                color="#0dac9a"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="flex items-center justify-center gap-7 my-auto">
        {visibleProductsForDesktop.map((item) => (
          <motion.div
            key={item.id}
            className="hidden xl:flex flex-col items-center rounded-3xl shadow-lg h-[20.5rem] overflow-hidden"
            style={{ willChange: "transform, opacity" }}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Image
              src={item.image}
              width={285}
              height={500}
              alt={item.title}
              className="rounded-t-3xl h-56"
            />
            <div className="w-60 flex justify-around gap-6 items-end mt-6">
              <div>
                <h2 className="text-xl font-medium">{item.title}</h2>
                <p className="text-xs">{item.description}</p>
              </div>
              <Play
                size={40}
                className="mb-2 shadow-lg bg-grayBg rounded-3xl p-1"
                color="#0dac9a"
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile View */}
      <div className="flex items-center">
        {visibleProductsInMobile.map((item) => (
          <motion.div
            key={item.id}
            className="md:hidden flex flex-col items-center rounded-3xl shadow-lg"
            style={{ willChange: "transform, opacity" }}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
            variants={slideVariants}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <Image
              src={item.image}
              width={285}
              height={500}
              alt={item.title}
              className="rounded-t-3xl h-56"
            />
            <div className="w-60 h-20 flex justify-around gap-2 items-end mb-5">
              <div className="flex flex-col gap-1">
                <h2 className="text-xl font-medium ml-2">{item.title}</h2>
                <p className="text-xs ml-2">{item.description}</p>
              </div>
              <Play
                size={40}
                className="mb-2 shadow-lg bg-grayBg rounded-3xl p-1"
                color="#0dac9a"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProducts;
