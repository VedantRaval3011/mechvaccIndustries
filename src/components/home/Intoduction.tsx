"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Introduction = () => {
  const texts = ["Manufacturing", "Innovation", "Excellence"];
  const images = [
    { src: "/demo-1.jpg", alt: "Manufacturing facility showcasing industrial equipment" },
    { src: "/demo-2.jpg", alt: "Innovation in product development and design" },
    { src: "/demo-3.jpg", alt: "Excellence in quality control and testing" }
  ];
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  useEffect(() => {
    const animationInterval = setInterval(nextSlide, 5000);
    return () => clearInterval(animationInterval);
  }, [nextSlide]);

  return (
    <section 
      className="relative h-screen flex flex-col md:flex-row md:justify-between"
      aria-labelledby="hero-heading"
    >
      <div className="absolute inset-0 bg-[url('/wave.jpg')] bg-center z-[-1]" aria-hidden="true"></div>

      {/* Images Container with Framer Motion Crossfade */}
      <div className="relative w-full h-screen">
        <AnimatePresence mode="sync">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[activeIndex].src}
              alt={images[activeIndex].alt}
              className="w-full h-full object-cover grayscale"
              fill
              sizes="100vw"
              priority={activeIndex === 0}
              loading={activeIndex === 0 ? "eager" : "lazy"}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Overlay with Semi-Transparent Background and Text Shadow */}
      <div className="absolute top-0 left-0 text-white text-[1.45rem] md:text-3xl lg:text-4xl xl:text-6xl md:mt-24 px-3 md:px-7 uppercase mt-2 flex flex-col gap-0.5 z-20 p-4 rounded-lg  bg-opacity-50 3xl:text-7xl" style={{ textShadow: "0px 0px 8px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), 0px 0px 12px rgba(0,0,0,0.7)" }}>
        <motion.h1 id="hero-heading" className="mb-2">
          We Provide Effective and <br />
          <span className="font-bold">
            TOP-NOTCH{" "}
            <AnimatePresence mode="wait">
              <motion.span
                key={texts[activeIndex]}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="text-emerald-400 inline-block"
              >
                {texts[activeIndex]}
              </motion.span>
            </AnimatePresence>
          </span>{" "}
          <br /> Services
        </motion.h1>
        <motion.p className="font-medium mb-4">
          On-time. On-BUDGET. ON-POINT.
        </motion.p>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer flex gap-1 2xl:gap-2 bg-emerald-500 text-white px-3 py-2 rounded-3xl text-lg mt-1 uppercase xl:text-2xl 3xl:px-6 xl:py-2.5 3xl:py-4 xl:mt-7 3xl:text-3xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
            aria-label="Contact us for more information"
          >
            <span>Contact US</span>
            <motion.div
              className="flex items-center justify-center"
              animate={{ x: [0, 2, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 1.5, duration: 0.8 }}
              aria-hidden="true"
            >
              <Send className="3xl:size-7" />
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Screen reader only content for slide indicators */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Currently showing slide {activeIndex + 1} of {images.length}: {images[activeIndex].alt}
      </div>
    </section>
  );
};

export default Introduction;