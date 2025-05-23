"use client";
import React, { useRef, useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import Link from "next/link";

// Define the type for each service item
type Service = {
  _id: string;
  displayImage: string;
  description: string;
  displayTitle: string;
};

const FeaturedServices: React.FC = () => {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const [maxScroll, setMaxScroll] = useState<number>(0);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);

  // Fetch services from the API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services");
        if (!response.ok) throw new Error("Failed to fetch services");
        const data = await response.json();
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
    const updateMaxScroll = () => {
      if (carouselRef.current) {
        const totalWidth = carouselRef.current.scrollWidth / 2;
        const visibleWidth = carouselRef.current.offsetWidth;
        setMaxScroll(Math.max(0, totalWidth - visibleWidth));
      }
    };
    updateMaxScroll();
    window.addEventListener("resize", updateMaxScroll);
    return () => window.removeEventListener("resize", updateMaxScroll);
  }, [services]);

  // Auto-scrolling logic
  useEffect(() => {
    if (isInteracting || loading || error) return;

    const scrollStep = -1;
    const interval = setInterval(() => {
      const newX = x.get() + scrollStep;
      const loopWidth = carouselRef.current && carouselRef.current.scrollWidth
        ? carouselRef.current.scrollWidth / 2
        : 0;

      if (newX < -loopWidth) {
        x.set(newX + loopWidth);
      } else {
        x.set(newX);
      }
    }, 16);

    setAutoScrollInterval(interval);
    return () => clearInterval(interval);
  }, [isInteracting, loading, error, x]);

  // Handle drag events
  const handleDragStart = () => {
    setIsInteracting(true);
    if (autoScrollInterval) clearInterval(autoScrollInterval);
  };

  const handleDragEnd = () => {
    setTimeout(() => setIsInteracting(false), 2000);
  };

  const handleDrag = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { delta: { x: number } }
  ) => {
    const newX = x.get() + info.delta.x;
    const loopWidth = carouselRef.current && typeof carouselRef.current.scrollWidth === "number"
      ? carouselRef.current.scrollWidth / 2
      : 0;

    if (newX > 0) {
      x.set(newX - loopWidth);
    } else if (newX < -loopWidth) {
      x.set(newX + loopWidth);
    } else {
      x.set(newX);
    }
  };

  // Handle wheel events
  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    setIsInteracting(true);
    if (autoScrollInterval) clearInterval(autoScrollInterval);

    const newX = x.get() - event.deltaY;
    const loopWidth = carouselRef.current && typeof carouselRef.current.scrollWidth === "number"
      ? carouselRef.current.scrollWidth / 2
      : 0;

    if (newX > 0) {
      x.set(newX - loopWidth);
    } else if (newX < -loopWidth) {
      x.set(newX + loopWidth);
    } else {
      x.set(newX);
    }

    setTimeout(() => setIsInteracting(false), 2000);
  };

  // Add wheel event listener
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const wheelHandler = (event: WheelEvent) => handleWheel(event);
    carousel.addEventListener("wheel", wheelHandler, { passive: false });
    return () => carousel.removeEventListener("wheel", wheelHandler);
  }, [maxScroll]);

  // Skeleton loading component for services
  const ServiceSkeleton = () => (
    <div className="flex overflow-x-hidden gap-4 pb-4 py-16">
      {[...Array(6)].map((_, idx) => (
        <div
          key={idx}
          className={`flex-shrink-0 ${idx % 2 === 0 ? "w-[27.5rem]" : "w-[18rem]"}`}
        >
          {idx % 2 === 0 ? (
            <div className="h-80 rounded-xl overflow-hidden bg-gray-200 animate-pulse">
              <div className="h-full w-full bg-gray-300"></div>
              <div className="absolute bottom-0 left-0 right-0 bg-gray-400 bg-opacity-50 p-4 flex items-center">
                <div className="h-6 w-3/4 bg-gray-300 rounded flex-1"></div>
                <div className="h-10 w-24 bg-gray-300 rounded ml-4"></div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-200 shadow-md rounded-3xl h-[21rem] flex flex-col animate-pulse">
              <div className="h-56 bg-gray-300 rounded-t-3xl"></div>
              <div className="flex items-center p-4">
                <div className="flex-grow">
                  <div className="h-6 w-1/2 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
                </div>
                <div className="h-8 w-8 bg-gray-300 rounded-full ml-2"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  // Duplicate services for infinite scrolling
  const duplicatedServices = [...services, ...services];

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
        <Link href="/services">
          <button className="bg-[var(--color-green)] lg:text-3xl text-white text-2xl rounded-2xl cursor-pointer text-center p-2.5 lg:p-3">
            All Services
          </button>
        </Link>
      </div>
      <motion.div
        ref={carouselRef}
        whileTap={{ cursor: "grabbing" }}
        className="min-[2260px]:flex justify-center items-center"
      >
        {loading ? (
          <ServiceSkeleton />
        ) : (
          <motion.div
            className="flex overflow-x-hidden gap-4 pb-4 cursor-grab py-16"
            style={{ x, width: "fit-content" }}
            drag="x"
            dragConstraints={{ right: 0, left: -maxScroll }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrag={handleDrag}
          >
            {duplicatedServices.map((item, idx) => (
              <motion.div
                key={`${item._id}-${idx}`}
                className={`flex-shrink-0 ${idx % 2 === 0 ? "w-[27.5rem]" : "w-[18rem]"}`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                {idx % 2 === 0 ? (
                  <Link href={`/services/${item._id}`}>
                    <div className="h-80 relative group rounded-xl overflow-hidden cursor-pointer">
                      <Image
                        src={item.displayImage}
                        width={400}
                        height={300}
                        alt={item.displayTitle}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-opacity-50 text-white shadow-5xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center">
                        <h2 className="text-xl font-medium truncate text-bold flex-1 stroke-2 stroke-fuchsia-50">{item.displayTitle}</h2>
                        <button className="bg-[var(--color-green)] text-white px-4 py-2 rounded ml-4 cursor-pointer">
                          Know More
                        </button>
                      </div>
                    </div>
                  </Link>
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
        )}
      </motion.div>
    </div>
  );
};

export default FeaturedServices;