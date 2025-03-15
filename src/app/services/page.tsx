"use client";

import { useState, useEffect, useMemo } from "react";
import { Service } from "@/types/service"; // Assuming a Service type exists
import { Search, Filter, ChevronRight, List, X, Star } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch("/api/services");
        if (!res.ok) throw new Error("Failed to fetch services");
        const data: Service[] = await res.json();
        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchServices();
  }, []);

  const groupedServices = useMemo(() => {
    return services.reduce((acc: { [key: string]: Service[] }, service) => {
      const category = service.group || "Uncategorized";
      acc[category] = acc[category] || [];
      acc[category].push(service);
      return acc;
    }, {});
  }, [services]);

  const filteredGroupedServices = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered: { [key: string]: Service[] } = {};
    for (const [category, categoryServices] of Object.entries(
      groupedServices
    )) {
      filtered[category] = categoryServices.filter((service) => {
        const nameMatch = service.name.toLowerCase().includes(query);
        const categoryMatch = service.group.toLowerCase().includes(query);
        const priceMatch =
          (service.price ?? 0) >= priceFilter.min &&
          (service.price ?? 0) <= priceFilter.max;
        return (nameMatch || categoryMatch) && priceMatch;
      });
    }
    return filtered;
  }, [groupedServices, searchQuery, priceFilter]);

  const allFilteredServices = useMemo(() => {
    return Object.values(filteredGroupedServices).flat();
  }, [filteredGroupedServices]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "min" | "max"
  ) => {
    const value =
      e.target.value === ""
        ? type === "min"
          ? 0
          : Infinity
        : parseFloat(e.target.value);
    setPriceFilter((prev) => ({ ...prev, [type]: value }));
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriceFilter({ min: 0, max: Infinity });
    setActiveCategory("all");
  };

  const allCategories = Object.keys(filteredGroupedServices);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-gray-bg)] text-[var(--color-black)]">
        <motion.div
          className="relative w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <motion.div className="absolute inset-0 border-4 border-t-[var(--color-green)] border-r-transparent border-b-transparent border-l-transparent rounded-full"></motion.div>
        </motion.div>
        <motion.p
          className="mt-6 text-xl font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Discovering Services...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-5xl font-bold text-[var(--color-black)] mb-4">
            Our <span className="text-[var(--color-green)]">Premium</span>{" "}
            Services
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our exceptional range of professional services
          </p>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          className="mb-12 bg-white rounded-2xl p-6 shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full md:w-1/2">
              <motion.div
                className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                whileHover={{ scale: 1.1 }}
              >
                <Search className="text-[var(--color-green)] h-6 w-6" />
              </motion.div>
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search for a service..."
                className="w-full p-4 pl-14 rounded-xl border-2 border-gray-200 text-[var(--color-black)] focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent shadow-sm placeholder-gray-400 text-lg transition-all duration-300"
              />
              {searchQuery && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              )}
            </div>

            <motion.div
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-[var(--color-black)] font-medium transition-all duration-300"
              >
                <Filter className="text-[var(--color-green)] h-5 w-5" />
                <span>Filters</span>
                <motion.span
                  animate={{ rotate: showFilters ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetFilters}
                className="px-5 py-3 rounded-xl bg-[var(--color-green)] text-white font-medium hover:bg-opacity-90 transition-all duration-300"
              >
                Reset
              </motion.button>
            </motion.div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-3">
                      PRICE RANGE
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        placeholder="Min"
                        onChange={(e) => handlePriceFilterChange(e, "min")}
                        className="p-3 rounded-lg border-2 border-gray-200 w-full text-[var(--color-black)] focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all duration-300"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        onChange={(e) => handlePriceFilterChange(e, "max")}
                        className="p-3 rounded-lg border-2 border-gray-200 w-full text-[var(--color-black)] focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Category Navigation */}
        {allCategories.length > 0 && (
          <motion.div
            className="mb-12 overflow-x-auto py-2 no-scrollbar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="flex gap-3 pb-2 pl-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory("all")}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeCategory === "all"
                    ? "bg-[var(--color-green)] text-white shadow-md"
                    : "bg-white text-[var(--color-black)] border-2 border-gray-200 hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                }`}
              >
                <List className="h-5 w-5 mr-2" />
                All Services
              </motion.button>

              {allCategories.map((category) => (
                <motion.button
                  key={category}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-[var(--color-green)] text-white shadow-md"
                      : "bg-white text-[var(--color-black)] border-2 border-gray-200 hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Service Showcase */}
        {allFilteredServices.length === 0 ? (
          <motion.div
            className="text-center py-20 bg-white rounded-2xl shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            </motion.div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">
              No Results Found
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
              We couldn't find any services that match your current filters.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
              className="px-8 py-3 bg-[var(--color-green)] text-white rounded-xl hover:bg-opacity-90 transition-all duration-300 text-lg font-medium shadow-md"
            >
              View All Services
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <AnimatePresence>
              {(activeCategory === "all"
                ? allFilteredServices
                : filteredGroupedServices[activeCategory] || []
              ).map((service, index) => (
                <motion.div
                  key={service._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    {service.displayImage && service.displayImage !== "" ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="relative h-64 overflow-hidden"
                      >
                        <img
                          src={service.displayImage}
                          alt={service.displayTitle}
                          className="w-full h-full object-cover transform transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </motion.div>
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                          className="p-6 bg-white rounded-full shadow-md"
                        >
                          <img
                            src="/no-image-placeholder.png"
                            alt="No Image"
                            className="h-20 w-20 opacity-40"
                          />
                        </motion.div>
                      </div>
                    )}

                    {service.price && (
                      <motion.div
                        className="absolute top-4 right-4 bg-[var(--color-green)] text-white py-1 px-3 rounded-full font-bold text-sm shadow-md"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        ${service.price}
                      </motion.div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-green)] mb-1">
                          {service.group || "Uncategorized"}
                        </p>
                        <h3 className="text-xl font-bold text-[var(--color-black)] leading-tight">
                          {service.displayTitle}
                        </h3>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      </motion.div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {service.name}
                    </p>

                    {service.seoKeywords && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {service.seoKeywords
                          .split(",")
                          .slice(0, 3)
                          .map((keyword, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md"
                            >
                              {keyword.trim()}
                            </span>
                          ))}
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-6">
                      <div className="flex items-center gap-3">
                        {service.video && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={service.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-green)] font-medium text-sm hover:underline flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
                          >
                            Video
                          </motion.a>
                        )}

                        {service.pdf && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={service.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-green)] font-medium text-sm hover:underline flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
                          >
                            PDF
                          </motion.a>
                        )}
                      </div>

                      <Link href={`/services/${service._id}`}>
                        <motion.button
                          className="flex items-center px-5 py-2 bg-[var(--color-green)] text-white rounded-xl hover:bg-opacity-90 transition-all duration-300 font-medium"
                          whileHover={{
                            scale: 1.05,
                            x: 5,
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Details
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                          >
                            <ChevronRight className="ml-1 h-5 w-5" />
                          </motion.div>
                        </motion.button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}
