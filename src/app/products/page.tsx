"use client";

import { useState, useEffect, useMemo } from "react";
import { Product } from "@/types/product";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Filter, ChevronRight, List, X, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense } from "react"; // Import Suspense

// Child component containing the main logic and UI
function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<{ min: number; max: number }>({
    min: 0,
    max: Infinity,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeGroup, setActiveGroup] = useState<string>(
    searchParams.get("activeGroup") || "all"
  );
  const [showFilters, setShowFilters] = useState<boolean>(false);

  useEffect(() => {
    const newActiveGroup = searchParams.get("activeGroup") || "all";
    if (newActiveGroup !== activeGroup) {
      setActiveGroup(newActiveGroup);
    }
  }, [searchParams, activeGroup]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Failed to fetch products");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const groupedProducts = useMemo(() => {
    return products.reduce((acc: { [key: string]: Product[] }, product) => {
      const group = product.group || "Uncategorized";
      acc[group] = acc[group] || [];
      acc[group].push(product);
      return acc;
    }, {});
  }, [products]);

  const filteredGroupedProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered: { [key: string]: Product[] } = {};
    for (const [group, groupProducts] of Object.entries(groupedProducts)) {
      filtered[group] = groupProducts.filter((product) => {
        const nameMatch = product.name.toLowerCase().includes(query);
        const groupMatch = product.group.toLowerCase().includes(query);
        const priceMatch =
          (product.price ?? 0) >= priceFilter.min &&
          (product.price ?? 0) <= priceFilter.max;
        return (nameMatch || groupMatch) && priceMatch;
      });
    }
    return filtered;
  }, [groupedProducts, searchQuery, priceFilter]);

  const allFilteredProducts = useMemo(() => {
    return Object.values(filteredGroupedProducts).flat();
  }, [filteredGroupedProducts]);

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
    setActiveGroup("all");
    router.push("/products");
  };

  const handleGroupChange = (group: string) => {
    setActiveGroup(group);
    router.push(`/products?activeGroup=${encodeURIComponent(group)}`);
  };

  const allGroups = Object.keys(filteredGroupedProducts);

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
          Discovering Products...
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
            Products
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse our carefully curated collection of exceptional products
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
                placeholder="What are you looking for?"
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
                        value={priceFilter.min === 0 ? "" : priceFilter.min}
                        onChange={(e) => handlePriceFilterChange(e, "min")}
                        className="p-3 rounded-lg border-2 border-gray-200 w-full text-[var(--color-black)] focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent transition-all duration-300"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={
                          priceFilter.max === Infinity ? "" : priceFilter.max
                        }
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

        {/* Group Navigation */}
        {allGroups.length > 0 && (
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
                onClick={() => handleGroupChange("all")}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeGroup === "all"
                    ? "bg-[var(--color-green)] text-white shadow-md"
                    : "bg-white text-[var(--color-black)] border-2 border-gray-200 hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                }`}
              >
                <List className="h-5 w-5 mr-2" />
                All Products
              </motion.button>

              {allGroups.map((group) => (
                <motion.button
                  key={group}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleGroupChange(group)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeGroup === group
                      ? "bg-[var(--color-green)] text-white shadow-md"
                      : "bg-white text-[var(--color-black)] border-2 border-gray-200 hover:border-[var(--color-green)] hover:text-[var(--color-green)]"
                  }`}
                >
                  {group}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Product Showcase */}
        {allFilteredProducts.length === 0 ? (
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
              We couldn’t find any products that match your current filters.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
              className="px-8 py-3 bg-[var(--color-green)] text-white rounded-xl hover:bg-opacity-90 transition-all duration-300 text-lg font-medium shadow-md"
            >
              View All Products
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
              {(activeGroup === "all"
                ? allFilteredProducts
                : filteredGroupedProducts[activeGroup] || []
              ).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden group"
                >
                  <div className="relative overflow-hidden">
                    {product.displayImage && product.displayImage !== "" ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                        className="relative w-full h-64 overflow-hidden"
                      >
                        <Image
                          src={product.displayImage}
                          alt={product.displayTitle}
                          width={400}
                          height={256}
                          className="w-full h-full object-contain transform transition-transform duration-700"
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
                          <Image
                            src="/no-image-placeholder.png"
                            alt="No Image"
                            width={80}
                            height={80}
                            className="opacity-40"
                          />
                        </motion.div>
                      </div>
                    )}

                    {product.price && (
                      <motion.div
                        className="absolute top-4 right-4 bg-[var(--color-green)] text-white py-1 px-3 rounded-full font-bold text-sm shadow-md"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        ₹{product.price}
                      </motion.div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--color-green)] mb-1">
                          {product.group || "Uncategorized"}
                        </p>
                        <h3 className="text-xl font-bold text-[var(--color-black)] leading-tight">
                          {product.displayTitle}
                        </h3>
                      </div>
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                      </motion.div>
                    </div>

                    {product.seoKeywords && (
                      <div className="flex flex-wrap gap-2 mb-5">
                        {product.seoKeywords
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
                        {product.video && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={product.video}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-green)] font-medium text-sm hover:underline flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
                          >
                            Video
                          </motion.a>
                        )}

                        {product.pdf && (
                          <motion.a
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            href={product.pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--color-green)] font-medium text-sm hover:underline flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-lg"
                          >
                            PDF
                          </motion.a>
                        )}
                      </div>

                      <Link href={`/products/${product._id}`}>
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

// Main page component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
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
            Loading Products...
          </motion.p>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}