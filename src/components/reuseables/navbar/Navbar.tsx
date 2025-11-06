"use client";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Oxanium } from "next/font/google";
import {
  Home,
  ShoppingCart,
  Settings,
  ChevronDown,
  MoreHorizontal,
  Phone,
  Mail,
  LucideIcon
} from "lucide-react";
import { useProductStore } from "@/store/productStore";

// Environment variables - moved outside component to prevent re-creation
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE;
const NODE_ENV = process.env.NODE_ENV;
const IS_MAINTENANCE = MAINTENANCE_MODE && NODE_ENV === 'production';

// Constants moved outside component
const PRODUCT_CACHE_KEY = "mechvacc-product-groups";
const SERVICE_CACHE_KEY = "mechvacc-service-groups";
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

// Font instance - created once
const oxanium = Oxanium({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Types
interface DropdownItem {
  name: string;
  href: string;
  displayTitle?: string;
}

interface NavItem {
  name: string;
  href: string;
  icon?: LucideIcon;
  dropdown?: DropdownItem[];
}

interface ExtraInfoItem {
  icon: LucideIcon;
  info: string;
}

interface ProductType {
  _id: string;
  name: string;
  displayTitle: string;
  group: string;
  price: number;
  displayImage: string;
  additionalImages: string[];
  video: string;
  pdf: string;
  seoKeywords: string;
}

interface ServiceType {
  _id: string;
  name: string;
  displayTitle: string;
  group: string;
  price: number;
  displayImage: string;
  additionalImages: string[];
  video: string;
  pdf: string;
  seoKeywords: string;
}

// Utility functions moved outside component
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Mock data as constants
const MOCK_PRODUCTS: ProductType[] = [
  { _id: "p1", name: "Product 1", displayTitle: "Featured Product 1", group: "Manufacturing", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "p2", name: "Product 2", displayTitle: "Featured Product 2", group: "Manufacturing", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "p3", name: "Product 3", displayTitle: "Special Product 3", group: "Automation", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "p4", name: "Product 4", displayTitle: "Special Product 4", group: "Automation", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "p5", name: "Product 5", displayTitle: "New Product 5", group: "Robotics", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
];

const MOCK_SERVICES: ServiceType[] = [
  { _id: "s1", name: "Service 1", displayTitle: "Maintenance Service", group: "Maintenance", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "s2", name: "Service 2", displayTitle: "Repair Service", group: "Maintenance", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "s3", name: "Service 3", displayTitle: "Installation Service", group: "Installation", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
  { _id: "s4", name: "Service 4", displayTitle: "Support Service", group: "Support", price: 0, displayImage: "", additionalImages: [], video: "", pdf: "", seoKeywords: "" },
];

// Memoized AnimatedText component
const AnimatedText = memo(() => {
  const animatedLetters = useMemo(() => {
    const text = "MECHVACC";
    const delay = 0.15;
    
    return text.split('').map((letter, index) => (
      <span 
        key={index}
        className="inline-block"
        style={{
          animation: `colorCycle 8s infinite`,
          animationDelay: `${index * delay}s`
        }}
      >
        {letter}
      </span>
    ));
  }, []);

  return (
    <div className={`${oxanium.className} text-xl lg:text-lg xl:text-3xl 3xl:text-4xl font-bold`}>
      {animatedLetters}
      <style jsx>{`
        @keyframes colorCycle {
          0% { color: #1ab2a1; }
          20% { color: #2a8076; } 
          40% { color: #3eaca0; } 
          60% { color: #1ab2a1; }
          80% { color: #3eaca0; } 
          100% { color: #1ab2a1; } 
        }
      `}</style>
    </div>
  );
});

AnimatedText.displayName = 'AnimatedText';

// Memoized dropdown component
const DropdownMenu = memo(({ 
  item, 
  productGroups, 
  serviceGroups, 
  isLoading 
}: {
  item: NavItem;
  productGroups: Record<string, DropdownItem[]>;
  serviceGroups: Record<string, DropdownItem[]>;
  isLoading: boolean;
}) => {
  const shouldShowDropdown = useMemo(() => {
    if (!item.dropdown) return false;
    return item.name === "PRODUCTS" || item.name === "SERVICES" || item.dropdown.length > 0;
  }, [item]);

  if (!shouldShowDropdown) return null;

  return (
    <div className="absolute left-0 mt-12 w-52 rounded-xl shadow-lg bg-white border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
      <div className="py-2">
        {(item.name === "PRODUCTS" || item.name === "SERVICES") && 
         (item.dropdown?.length === 0 || isLoading) && (
          <div className="px-4 py-2.5 text-sm text-gray-600 italic">
            Loading {item.name.toLowerCase()}...
          </div>
        )}
        {item.dropdown && item.dropdown.length > 0 && item.dropdown.map((groupItem) => (
          <div key={groupItem.name} className="relative group/nested">
            <Link
              href={groupItem.href}
              className={`px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center justify-between cursor-pointer transition-all duration-300 font-medium ${oxanium.className} text-gray-800`}
            >
              <span className="leading-tight">{groupItem.name}</span>
              <ChevronDown size={14} className="transform -rotate-90" />
            </Link>
            {item.name === "PRODUCTS" && productGroups[groupItem.name] && (
              <div className="absolute left-full top-0 w-60 rounded-lg shadow-xl bg-white border border-gray-100 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-300 z-50">
                <div className="py-2">
                  {productGroups[groupItem.name].map((product, index) => (
                    <Link
                      key={index}
                      href={product.href}
                      className={`block px-5 py-2.5 text-[15px] font-medium hover:bg-gray-50 hover:text-green transition-all duration-300 cursor-pointer ${oxanium.className} text-gray-700`}
                    >
                      {product.displayTitle || product.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {item.name === "SERVICES" && serviceGroups[groupItem.name] && (
              <div className="absolute left-full top-0 w-60 rounded-lg shadow-xl bg-white border border-gray-100 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-300 z-50">
                <div className="py-2">
                  {serviceGroups[groupItem.name].map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className={`block px-5 py-2.5 text-[15px] font-medium hover:bg-gray-50 hover:text-green transition-all duration-300 cursor-pointer ${oxanium.className} text-gray-700`}
                    >
                      {service.displayTitle || service.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

DropdownMenu.displayName = 'DropdownMenu';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [productGroups, setProductGroups] = useState<Record<string, DropdownItem[]>>({});
  const [serviceGroups, setServiceGroups] = useState<Record<string, DropdownItem[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const setStoreProducts = useProductStore((state) => state.setProducts);

  // Check if current route is admin
  const isAdminRoute = useMemo(() => pathname.startsWith('/admin'), [pathname]);

  // Admin navigation items
  const adminNavItems = useMemo<NavItem[]>(() => [
    { name: "ADD SERVICE", href: "/admin/addService" },
    { name: "ADD PRODUCT", href: "/admin/addProduct" },
    { name: "USERS", href: "/admin/users" },
  ], []);

  // Memoized static items
  const moreItems = useMemo<NavItem[]>(() => [
    { name: "ABOUT US", href: "/about" },
    { name: "CLIENTS", href: "/clients" },
    { name: "CAREERS", href: "/careers" },
  ], []);

  const extraInfo = useMemo<ExtraInfoItem[]>(() => [
    { icon: Phone, info: "+1 (555) 123-4567" },
    { icon: Mail, info: "info@example.com" },
  ], []);

  // Memoized navbar items
  const navbarItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { name: "HOME", href: "/", icon: Home },
    ];

    const productDropdown: DropdownItem[] = Object.keys(productGroups).map(group => ({
      name: group,
      href: `/products?activeGroup=${encodeURIComponent(group)}`,
    }));

    items.push({
      name: "PRODUCTS",
      href: "/products",
      icon: ShoppingCart,
      dropdown: productDropdown,
    });

    const serviceDropdown: DropdownItem[] = Object.keys(serviceGroups).map(group => ({
      name: group,
      href: `/services?activeGroup=${encodeURIComponent(group)}`,
    }));

    items.push({
      name: "SERVICES",
      href: "/services",
      icon: Settings,
      dropdown: serviceDropdown,
    });

    return items;
  }, [productGroups, serviceGroups]);

  // Optimized fetch functions with proper error handling
  const fetchProducts = useCallback(async (): Promise<Record<string, DropdownItem[]>> => {
    try {
      let products: ProductType[] = MOCK_PRODUCTS;
      
      try {
        const response = await fetch('/api/products', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            products = data;
          }
        }
      } catch (fetchError) {
        console.warn("Using mock data due to API error:", fetchError);
      }

      const groups: Record<string, DropdownItem[]> = {};
      products.forEach(product => {
        if (!groups[product.group]) {
          groups[product.group] = [];
        }
        groups[product.group].push({
          name: product.name,
          href: `/products/${createSlug(product.name)}`,
          displayTitle: product.displayTitle
        });
      });

      setStoreProducts(products);
      
      try {
        localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
          data: groups,
          timestamp: Date.now()
        }));
      } catch (storageError) {
        console.warn("Could not cache product data:", storageError);
      }

      return groups;
    } catch (error) {
      console.error("Error processing products:", error);
      return {};
    }
  }, [setStoreProducts]);

  const fetchServices = useCallback(async (): Promise<Record<string, DropdownItem[]>> => {
    try {
      let services: ServiceType[] = MOCK_SERVICES;
      
      try {
        const response = await fetch('/api/services', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data) && data.length > 0) {
            services = data;
          }
        }
      } catch (fetchError) {
        console.warn("Using mock data due to API error:", fetchError);
      }

      const groups: Record<string, DropdownItem[]> = {};
      services.forEach(service => {
        if (!groups[service.group]) {
          groups[service.group] = [];
        }
        groups[service.group].push({
          name: service.name,
          href: `/services/${createSlug(service.name)}`,
          displayTitle: service.displayTitle
        });
      });

      try {
        localStorage.setItem(SERVICE_CACHE_KEY, JSON.stringify({
          data: groups,
          timestamp: Date.now()
        }));
      } catch (storageError) {
        console.warn("Could not cache service data:", storageError);
      }

      return groups;
    } catch (error) {
      console.error("Error processing services:", error);
      return {};
    }
  }, []);

  // Toggle handler with useCallback
  const toggleMore = useCallback(() => {
    setIsMoreOpen(prev => !prev);
  }, []);

  const closeMore = useCallback(() => {
    setIsMoreOpen(false);
  }, []);

  // Optimized data loading effect
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Check cache first
        const promises: Promise<Record<string, DropdownItem[]>>[] = [];
        let needsProductFetch = true;
        let needsServiceFetch = true;

        try {
          const cachedProductData = localStorage.getItem(PRODUCT_CACHE_KEY);
          if (cachedProductData) {
            const { data, timestamp } = JSON.parse(cachedProductData);
            if (Date.now() - timestamp < CACHE_EXPIRY && Object.keys(data).length > 0) {
              if (isMounted) setProductGroups(data);
              needsProductFetch = false;
            }
          }

          const cachedServiceData = localStorage.getItem(SERVICE_CACHE_KEY);
          if (cachedServiceData) {
            const { data, timestamp } = JSON.parse(cachedServiceData);
            if (Date.now() - timestamp < CACHE_EXPIRY && Object.keys(data).length > 0) {
              if (isMounted) setServiceGroups(data);
              needsServiceFetch = false;
            }
          }
        } catch (parseError) {
          console.warn("Error parsing cached data:", parseError);
        }

        // Fetch missing data
        if (needsProductFetch) {
          promises.push(fetchProducts().then(groups => {
            if (isMounted) setProductGroups(groups);
            return groups;
          }));
        }

        if (needsServiceFetch) {
          promises.push(fetchServices().then(groups => {
            if (isMounted) setServiceGroups(groups);
            return groups;
          }));
        }

        if (promises.length > 0) {
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchProducts, fetchServices]);

  if (IS_MAINTENANCE) {
    return (
      <nav className="py-2 pb-3 text-[#50c2a7] sticky top-0 bg-white shadow-lg z-50 xl:py-3 xl:pb-3.5 antialiased">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 lg:gap-1 cursor-pointer">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/mechvacc-logo.png"
                  height={50}
                  width={50}
                  alt="Mechvacc Logo"
                  priority
                />
                <AnimatedText />
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="py-2 pb-3 text-[#50c2a7] sticky top-0 bg-white shadow-lg z-50 xl:py-3 xl:pb-3.5 antialiased">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 lg:gap-1 cursor-pointer">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/mechvacc-logo.png"
                  height={50}
                  width={50}
                  alt="Mechvacc Logo"
                  priority
                />
                <AnimatedText />
              </Link>
            </div>
            
            <div className="hidden lg:flex items-center space-x-6 lg:space-x-4">
              {isAdminRoute ? (
                // Admin Navigation
                <>
                  {adminNavItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`px-2 xl:px-3 py-3 rounded-md text-balance lg:text-lg 3xl:text-xl font-medium flex items-center cursor-pointer transition-all duration-300 antialiased ${
                        pathname === item.href
                          ? "text-green border-b-2 border-green"
                          : "text-black hover:text-green"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              ) : (
                // Regular Navigation
                <>
                  {navbarItems.map((item) => (
                    <div key={item.name} className="relative group flex text-black">
                      <Link
                        href={item.href}
                        className="xl:px-3 lg:px-2 px-2 py-3 rounded-md text-balance lg:text-lg 3xl:text-xl font-medium hover:text-green flex items-center cursor-pointer transition-all duration-300 antialiased"
                      >
                        {item.name}
                      </Link>
                      {(item.dropdown && item.dropdown.length > 0) && (
                        <ChevronDown size={16} className="mt-4 cursor-pointer" />
                      )}
                      <DropdownMenu 
                        item={item}
                        productGroups={productGroups}
                        serviceGroups={serviceGroups}
                        isLoading={isLoading}
                      />
                    </div>
                  ))}
                  {moreItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-2 xl:px-3 py-3 text-black text-lg rounded-md font-medium hover:text-green 3xl:text-xl cursor-pointer transition-all duration-300 text-balance antialiased"
                    >
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
            </div>
            
            <div className="md:block">
              <Link href="/enquiry">
                <button className="px-3 py-2 bg-green-gradient text-center text-base lg:text-base xl:text-lg rounded-xl text-white flex items-center gap-2 lg:px-5 lg:py-2.5 xl:mr-8 3xl:text-xl 3xl:px-6 3xl:py-3.5 cursor-pointer hover:opacity-90 transition-all duration-300 font-medium">
                  ENQUIRY
                  <Image
                    src="/conversation.png"
                    height={25}
                    width={25}
                    alt="Enquiry Icon"
                  />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 antialiased">
        <div className="flex justify-around items-center h-16">
          {navbarItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full hover:text-green cursor-pointer transition-all duration-300"
            >
              {item.icon && <item.icon size={24} />}
              <span className="text-xs mt-1 font-medium">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={toggleMore}
            className="flex flex-col items-center justify-center w-full h-full hover:text-green cursor-pointer transition-all duration-300"
          >
            <MoreHorizontal size={24} />
            <span className="text-xs mt-1 font-medium">MORE</span>
          </button>
        </div>
      </div>

      {/* Mobile More Menu */}
      {isMoreOpen && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white shadow-lg p-4 space-y-4 z-40 antialiased">
          {moreItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-green cursor-pointer transition-all duration-300"
              onClick={closeMore}
            >
              {item.name}
            </Link>
          ))}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {extraInfo.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 mb-2 text-green"
              >
                <item.icon size={16} />
                <span>{item.info}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Navbar);