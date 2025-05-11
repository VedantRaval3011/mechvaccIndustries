"use client";
import React, { useState, useEffect, JSX } from "react";
import Link from "next/link";
import Image from "next/image";
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

// Environment variables
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE;
const NODE_ENV = process.env.NODE_ENV;

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

const oxanium = Oxanium({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Cache key constants
const PRODUCT_CACHE_KEY = "mechvacc-product-groups";
const SERVICE_CACHE_KEY = "mechvacc-service-groups";
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

// Function to convert product name to URL slug
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Remove duplicate hyphens
    .trim();
};

// MECHVACC text animation component
const AnimatedText: React.FC = () => {
  const [letters, setLetters] = useState<JSX.Element[]>([]);
  
  useEffect(() => {
    const text = "MECHVACC";
    const delay = 0.15; // Delay between each letter animation
    
    const animatedLetters = text.split('').map((letter, index) => (
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
    
    setLetters(animatedLetters);
  }, []);

  return (
    <div className={`${oxanium.className} text-xl lg:text-lg xl:text-3xl 3xl:text-4xl font-bold`}>
      {letters}
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
};

const Navbar: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [productGroups, setProductGroups] = useState<Record<string, DropdownItem[]>>({});
  const [serviceGroups, setServiceGroups] = useState<Record<string, DropdownItem[]>>({});
  const [navbarItems, setNavbarItems] = useState<NavItem[]>([
    { name: "HOME", href: "/", icon: Home },
    { 
      name: "PRODUCTS", 
      href: "/products", 
      icon: ShoppingCart,
      dropdown: [] 
    },
    { 
      name: "SERVICES", 
      href: "/services", 
      icon: Settings,
      dropdown: [] 
    }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const setStoreProducts = useProductStore((state) => state.setProducts);

  useEffect(() => {
    const loadCachedData = async () => {
      try {
        setIsLoading(true);
        
        const cachedProductData = localStorage.getItem(PRODUCT_CACHE_KEY);
        const cachedServiceData = localStorage.getItem(SERVICE_CACHE_KEY);
        let needsProductFetch = true;
        let needsServiceFetch = true;

        if (cachedProductData) {
          try {
            const { data, timestamp } = JSON.parse(cachedProductData);
            if (Date.now() - timestamp < CACHE_EXPIRY && Object.keys(data).length > 0) {
              setProductGroups(data);
              needsProductFetch = false;
            }
          } catch (e) {
            console.error("Error parsing cached product data:", e);
          }
        }

        if (cachedServiceData) {
          try {
            const { data, timestamp } = JSON.parse(cachedServiceData);
            if (Date.now() - timestamp < CACHE_EXPIRY && Object.keys(data).length > 0) {
              setServiceGroups(data);
              needsServiceFetch = false;
            }
          } catch (e) {
            console.error("Error parsing cached service data:", e);
          }
        }

        const fetchPromises = [];
        
        if (needsProductFetch) {
          fetchPromises.push(fetchProducts());
        }

        if (needsServiceFetch) {
          fetchPromises.push(fetchServices());
        }

        if (fetchPromises.length > 0) {
          await Promise.all(fetchPromises);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
        try {
          await Promise.all([fetchProducts(), fetchServices()]);
        } catch (e) {
          console.error("Error during fallback fetch:", e);
          setIsLoading(false);
        }
      }
    };

    const fetchProducts = async () => {
      try {
        const mockProducts = [
          { _id: "p1", name: "Product 1", displayTitle: "Featured Product 1", group: "Manufacturing" },
          { _id: "p2", name: "Product 2", displayTitle: "Featured Product 2", group: "Manufacturing" },
          { _id: "p3", name: "Product 3", displayTitle: "Special Product 3", group: "Automation" },
          { _id: "p4", name: "Product 4", displayTitle: "Special Product 4", group: "Automation" },
          { _id: "p5", name: "Product 5", displayTitle: "New Product 5", group: "Robotics" },
        ];
        
        let products: ProductType[];
        
        try {
          const response = await fetch('/api/products');
          products = await response.json();
          
          if (!products || !Array.isArray(products) || products.length === 0) {
            console.warn("No products returned from API, using mock data");
            products = mockProducts as ProductType[];
          }
        } catch (fetchError) {
          console.warn("Error fetching products from API, using mock data:", fetchError);
          products = mockProducts as ProductType[];
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

        setProductGroups(groups);
        setStoreProducts(products); // Populate the Zustand store
        localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
          data: groups,
          timestamp: Date.now()
        }));
        return groups;
      } catch (error) {
        console.error("Error processing products:", error);
        return {};
      }
    };

    const fetchServices = async () => {
      try {
        const mockServices = [
          { _id: "s1", name: "Service 1", displayTitle: "Maintenance Service", group: "Maintenance" },
          { _id: "s2", name: "Service 2", displayTitle: "Repair Service", group: "Maintenance" },
          { _id: "s3", name: "Service 3", displayTitle: "Installation Service", group: "Installation" },
          { _id: "s4", name: "Service 4", displayTitle: "Support Service", group: "Support" },
        ];
        
        let services: ServiceType[];
        
        try {
          const response = await fetch('/api/services');
          services = await response.json();
          
          if (!services || !Array.isArray(services) || services.length === 0) {
            console.warn("No services returned from API, using mock data");
            services = mockServices as ServiceType[];
          }
        } catch (fetchError) {
          console.warn("Error fetching services from API, using mock data:", fetchError);
          services = mockServices as ServiceType[];
        }

        const groups: Record<string, DropdownItem[]> = {};
        services.forEach(service => {
          if (!groups[service.group]) {
            groups[service.group] = [];
          }
          groups[service.group].push({
            name: service.name,
            href: `/services/${createSlug(service.name)}`, // Use createSlug for services too
            displayTitle: service.displayTitle
          });
        });

        setServiceGroups(groups);
        localStorage.setItem(SERVICE_CACHE_KEY, JSON.stringify({
          data: groups,
          timestamp: Date.now()
        }));
        return groups;
      } catch (error) {
        console.error("Error processing services:", error);
        return {};
      }
    };

    loadCachedData().finally(() => {
      setIsLoading(false);
    });
  }, [setStoreProducts]);

  useEffect(() => {
    const getNavbarItems = (): NavItem[] => {
      const items: NavItem[] = [
        { name: "HOME", href: "/", icon: Home },
      ];

      const productDropdown: DropdownItem[] = [];
      Object.keys(productGroups).forEach(group => {
        productDropdown.push({
          name: group,
          href: `/products?activeGroup=${encodeURIComponent(group)}`,
        });
      });

      items.push({
        name: "PRODUCTS",
        href: "/products",
        icon: ShoppingCart,
        dropdown: productDropdown,
      });

      const serviceDropdown: DropdownItem[] = [];
      Object.keys(serviceGroups).forEach(group => {
        serviceDropdown.push({
          name: group,
          href: `/services?activeGroup=${encodeURIComponent(group)}`,
        });
      });

      items.push({
        name: "SERVICES",
        href: "/services",
        icon: Settings,
        dropdown: serviceDropdown,
      });

      return items;
    };

    if (!isLoading) {
      setNavbarItems(getNavbarItems());
    }
  }, [productGroups, serviceGroups, isLoading]);

  const moreItems: NavItem[] = [
    { name: "ABOUT US", href: "/about" },
    { name: "CLIENTS", href: "/clients" },
    { name: "CAREERS", href: "/careers" },
  ];

  const extraInfo: ExtraInfoItem[] = [
    { icon: Phone, info: "+1 (555) 123-4567" },
    { icon: Mail, info: "info@example.com" },
  ];

  const shouldShowDropdown = (item: NavItem) => {
    if (!item.dropdown) return false;
    
    if (item.name === "PRODUCTS" || item.name === "SERVICES") {
      return true;
    }
    
    return item.dropdown.length > 0;
  };

  // Hide navbar items in maintenance mode for production
  const isMaintenance = MAINTENANCE_MODE && NODE_ENV === 'production';

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
                />
                <AnimatedText />
              </Link>
            </div>
            {!isMaintenance && (
              <>
                <div className="hidden lg:flex items-center space-x-6 lg:space-x-4">
                  {navbarItems.map((item) => (
                    <div key={item.name} className="relative group flex text-black">
                      <Link
                        href={item.href}
                        className="xl:px-3 lg:px-2 px-2 py-3 rounded-md text-base lg:text-lg 3xl:text-xl font-medium hover:text-green flex items-center cursor-pointer transition-all duration-300"
                      >
                        {item.name}
                      </Link>
                      {shouldShowDropdown(item) && (
                        <ChevronDown size={16} className="mt-4 cursor-pointer" />
                      )}
                      {shouldShowDropdown(item) && (
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
                      )}
                    </div>
                  ))}
                  {moreItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="px-2 xl:px-3 py-3 text-black text-lg rounded-md font-medium hover:text-green 3xl:text-xl cursor-pointer transition-all duration-300"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <Link href="/enquiry">
                  <div className="md:block">
                    <button className="px-3 py-2 bg-green-gradient text-center text-base lg:text-base xl:text-lg rounded-xl text-white flex items-center gap-2 lg:px-5 lg:py-2.5 xl:mr-8 3xl:text-xl 3xl:px-6 3xl:py-3.5 cursor-pointer hover:opacity-90 transition-all duration-300 font-medium">
                      ENQUIRY
                      <Image
                        src="/conversation.png"
                        height={25}
                        width={25}
                        alt="Enquiry Icon"
                      />
                    </button>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {!isMaintenance && (
        <>
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
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex flex-col items-center justify-center w-full h-full hover:text-green cursor-pointer transition-all duration-300"
              >
                <MoreHorizontal size={24} />
                <span className="text-xs mt-1 font-medium">MORE</span>
              </button>
            </div>
          </div>

          {isMoreOpen && (
            <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white shadow-lg p-4 space-y-4 z-40 antialiased">
              {moreItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:text-green cursor-pointer transition-all duration-300"
                  onClick={() => setIsMoreOpen(false)}
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
      )}
    </>
  );
};

export default Navbar;