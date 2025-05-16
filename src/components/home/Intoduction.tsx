"use client";
import React, { useEffect, useState } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const Introduction = () => {
  const texts = ["Manufacturing", "lorem", "ipsum"];
  const images = ["/demo-1.jpg", "/demo-2.jpg", "/demo-3.jpg"];
  const [activeIndex, setActiveIndex] = useState(0);

  // Text shadow styling for better visibility
  const textShadowStyle = {
    textShadow: "0px 0px 8px rgba(0,0,0,0.9), 2px 2px 4px rgba(0,0,0,0.8), 0px 0px 12px rgba(0,0,0,0.7)"
  };

  useEffect(() => {
    const animationInterval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // 5 seconds for each slide

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="relative h-screen flex flex-col md:flex-row md:justify-between">
      <div className="absolute inset-0 bg-[url('/wave.jpg')] bg-center z-[-1]"></div>

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
              src={images[activeIndex]}
              alt="Background image"
              className="w-full h-full object-cover grayscale"
              fill
              sizes="100vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Overlay with Enhanced Shadow */}
      <div className="absolute top-0 left-0 text-white text-2xl md:text-3xl lg:text-4xl xl:text-6xl md:mt-24 px-3 md:px-7 uppercase mt-2 flex flex-col gap-0.5 z-20 p-4 rounded-lg 3xl:text-7xl">
        <motion.div style={textShadowStyle}>
          We Provide Effective and <br />{" "}
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
                style={textShadowStyle}
              >
                {texts[activeIndex]}
              </motion.span>
            </AnimatePresence>
          </span>{" "}
          <br /> Services
        </motion.div>
        <motion.div className="font-medium" style={textShadowStyle}>
          On-time. On-BUDGET. ON-POINT.
        </motion.div>
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer flex gap-1 2xl:gap-2 bg-emerald-500 text-white px-3 py-2 rounded-3xl text-lg mt-1 uppercase xl:text-2xl 3xl:px-6 xl:py-2.5 3xl:py-4 xl:mt-7 3xl:text-3xl"
            
          >
            <div>Contact US</div>
            <motion.div
              className="flex items-center justify-center"
              animate={{ x: [0, 2, 0] }}
              transition={{ repeat: Infinity, repeatDelay: 1.5, duration: 0.8 }}
            >
              <Send className="3xl:size-7" />
            </motion.div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default Introduction;