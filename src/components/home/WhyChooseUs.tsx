"use client";
import React, { useRef, useEffect, useState } from "react";
import { motion, useMotionValue } from "framer-motion";
import { List } from "lucide-react";
import Image from "next/image";
import styles from "./styles/whyChooseUs.module.css";

const data = [
  {
    icon: "/settings.png",
    title: "Industry Expertise",
    introDesc: "With deep knowledge of the non-metallic industry we have:",
    keyPoints: [
      "Precision in every order",
      "Complete process management",
      "High-quality, specialized products",
    ],
  },
  {
    icon: "/settings.png",
    title: "Innovative Solutions",
    introDesc:
      "We continually push the boundaries with cutting-edge innovations like:",
    keyPoints: [
      "Research-driven designs",
      "Collaborative R&D",
      "Tailored product offerings",
    ],
  },
  {
    icon: "/settings.png",
    title: "Unmatched Quality",
    introDesc:
      "We ensure that every product meets the highest quality standards through:",
    keyPoints: [
      "Rigorous quality control",
      "Advanced Lorem Ipsum ",
      "Lorem ipsum",
    ],
  },
  {
    icon: "/settings.png",
    title: "  Commitment",
    introDesc: "Our focus on sustainability is reflected in:",
    keyPoints: [
      "Eco-friendly materials",
      "Energy-efficient processes",
      "Minimizing waste",
    ],
  },
];

const WhyChooseUs = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState(0);

  useEffect(() => {
    const updateMaxScroll = () => {
      if (carouselRef.current) {
        setMaxScroll(
          carouselRef.current.scrollWidth - carouselRef.current.clientWidth
        );
      }
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);

    return () => window.removeEventListener("resize", updateMaxScroll);
  }, []);

  const handleDrag = (event: any, info: { delta: { x: number } }) => {
    const newX = x.get() + info.delta.x;
    x.set(clamp(newX, -maxScroll, 0));
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const newX = clamp(x.get() - e.deltaY, -maxScroll, 0);
    x.set(newX);
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const wheelHandler = (e: WheelEvent) => {
      e.preventDefault();
      handleWheel(e);
    };

    carousel.addEventListener("wheel", wheelHandler, { passive: false });

    return () => {
      carousel.removeEventListener("wheel", wheelHandler);
    };
  }, [maxScroll]);

  const clamp = (value: number, min: number, max: number) => {
    return Math.min(Math.max(value, min), max);
  };

  return (
    <div className="bg-grayBg flex flex-col xl:flex-row lg:flex-row xl:h-3/4 lg:p-10 gap-8 xl:gap-0 3xl:gap-40">
      <div className="mx-3 mt-10 flex flex-col gap-3 xl:pl-20 xl:mt-16">
        <h1 className="text-4xl xl:text-6xl md:text-5xl">
          Why Choose <br />
          <span className="relative font-semibold">
            MECHVACC{" "}
            <span className="inline-block bg-gradient-to-r from-greenGradientStart to-greenGradientEnd text-transparent bg-clip-text">
              ?
            </span>
            <span className="absolute left-[1px] text-green">MECHVACC</span>
          </span>
        </h1>
        <div className="text-2xl 3xl:max-w-96">
          We believe in shaping a sustainable <br className="hidden xl:block 3xl:hidden" />{" "}
          future by delivering innovative, <br className="hidden xl:block 3xl:hidden" />
          high-quality non-metallic solutions that stand the test of time.
        </div>
        <button className="bg-green flex p-2 3xl:p-2.5 text-white rounded-3xl gap-1 w-36 3xl:w-48 justify-center">
          <p className="container 3xl:text-xl">READ MORE</p>
          <List color="#ffffff" strokeWidth={1.75} />
        </button>
      </div>

      <motion.div
        ref={carouselRef}
        className="md:ml-0 w-full overflow-hidden xl:w-2/3 lg:mt-5 xl:mt-10"
        whileTap={{ cursor: "grabbing" }}>
        <motion.div
          drag="x"
          dragConstraints={{ right: 0, left: -maxScroll }}
          onDrag={handleDrag}
          className="flex gap-4"
          style={{ x }}>
          {data.map((item, idx) => (
            <motion.div
              key={idx}
              className={`border-green bg-white rounded-xl border min-w-[300px] p-5 m-2 flex-shrink-0 flex gap-1 flex-col items-center justify-start py-20 lg:py-10 xl:py-16 h-[33rem] lg:h-[30rem] xl:h-[33rem] ${styles.carousel}`}
              whileHover={{
                scale: 1.02,
                boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.3 },
              }}>
              <Image
                width={125}
                height={100}
                alt={item.title}
                className=""
                src={item.icon}
              />
              <h2 className="font-semibold my-2 text-3xl lg:text-2xl text-center">
                {item.title}
              </h2>
              <div className="border-b-green border-2 w-full"></div>
              <p className="text-center text-lg xl:text-xl mt-2 3xl:max-w-96">
                {item.introDesc}
              </p>
              <ul className="text-green mt-2 text-center text-xl flex flex-col gap-3">
                {item.keyPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WhyChooseUs;