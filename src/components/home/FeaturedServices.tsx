"use client";
import React, { useRef, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link"; // Import Link from Next.js

// Define the type for each service item based on your schema
type Service = {
  _id: string;
  displayImage: string;
  description: string;
  displayTitle: string;
};

// Utility function to clamp values within a range
const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const FeaturedServices: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null); // Ref for the carousel container
  const x = useMotionValue(0); // Motion value for horizontal scrolling
  const [maxScroll, setMaxScroll] = useState<number>(0); // Maximum scrollable distance
  const [services, setServices] = useState<Service[]>([]); // State for fetched services
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch services from the API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) {
          throw new Error("Failed to fetch services");
        }
        const data = await response.json();
        // Map the API data to the expected Service type
        const mappedServices: Service[] = data.map((service: Service) => ({
          _id: service._id,
          displayImage: service.displayImage,
          description: service.description,
          displayTitle: service.displayTitle,
        }));
        setServices(mappedServices);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Calculate the maximum scrollable width
  useEffect(() => {
    const updateMaxScroll = (): void => {
      if (carouselRef.current) {
        const totalWidth = carouselRef.current.scrollWidth;
        const visibleWidth = carouselRef.current.offsetWidth;
        setMaxScroll(Math.max(0, totalWidth - visibleWidth));
      }
    };

    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);
    return () => window.removeEventListener("resize", updateMaxScroll);
  }, [services]); // Re-run when services are loaded

  // Handle drag events to scroll horizontally
  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { delta: { x: number } }
  ): void => {
    const newX = clamp(x.get() + info.delta.x, -maxScroll, 0);
    x.set(newX);
  };

  // Handle wheel events to scroll horizontally
  const handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const newX = clamp(x.get() - event.deltaY, -maxScroll, 0);
    x.set(newX);
  };

  // Add wheel event listener to the carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const wheelHandler = (event: WheelEvent): void => {
      handleWheel(event);
    };

    carousel.addEventListener("wheel", wheelHandler, { passive: false });
    return () => {
      carousel.removeEventListener("wheel", wheelHandler);
    };
  }, [maxScroll]);

  if (loading) {
    return <div className="text-center py-10">Loading services...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="mx-auto overflow-hidden py-10 md:pt-16 md:ml-2">
      <div className="flex items-center flex-col text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 uppercase">
          You&apos;ll discover <br /> Expert Industrial <br />
          <span className="relative">
            Services{" "}
            <span className="absolute left-px text-[var(--color-green)]">Services</span>
          </span>
        </h1>
        <div>
          <button className="bg-[var(--color-green)] lg:text-3xl text-white text-2xl rounded-2xl cursor-pointer text-center p-2.5 lg:p-3">
            All Services
          </button>
        </div>
      
      </div>
      <motion.div
        ref={carouselRef}
        whileTap={{ cursor: "grabbing" }}
        className="min-[2260px]:flex justify-center items-center"
      >
        <motion.div
          className="flex overflow-x-hidden gap-4 pb-4 cursor-grab py-16"
          style={{ x, width: "fit-content" }}
          drag="x"
          dragConstraints={{ right: 0, left: -maxScroll }}
          onDrag={handleDrag}
        >
          {services.map((item, idx) => (
            <motion.div
              key={item._id} // Use _id as the key for uniqueness
              className={`flex-shrink-0 ${
                idx % 2 === 0 ? "w-[27.5rem]" : "w-[18rem]"
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              {idx % 2 === 0 ? (
                <div className="h-80">
                  <Link href={`/services/${item._id}`}>
                    <Image
                      src={item.displayImage}
                      width={400}
                      height={300}
                      alt={item.displayTitle}
                      className="rounded-xl h-full w-full object-cover cursor-pointer"
                    />
                  </Link>
                </div>
              ) : (
                <Link href={`/services/${item._id}`}>
                  <div className="bg-white shadow-md rounded-3xl h-[21rem] flex flex-col cursor-pointer">
                    <div className="h-56 overflow-hidden rounded-t-3xl">
                      <Image
                        src={item.displayImage}
                        width={500}
                        height={500}
                        alt={item.displayTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center p-4">
                      <div className="flex-grow">
                        <h2 className="text-xl font-medium mb-2">{item.displayTitle}</h2>
                        <p className="text-sm font-thin">{item.description}</p>
                      </div>
                      <div className="rounded-full hover:bg-[var(--color-green)] text-[var(--color-green)] hover:text-white bg-grayBg p-2 flex items-center justify-center ml-2">
                        <ArrowUpRight size={20} />
                      </div>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default FeaturedServices;