"use client";
import React, { useState, useEffect } from "react";
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
  icon:LucideIcon;
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

const Navbar: React.FC = () => {
  const [isMoreOpen, setIsMoreOpen] = useState<boolean>(false);
  const [productGroups, setProductGroups] = useState<Record<string, DropdownItem[]>>({});
  const [serviceGroups, setServiceGroups] = useState<Record<string, DropdownItem[]>>({});

  useEffect(() => {
    const loadCachedData = () => {
      try {
        const cachedProductData = localStorage.getItem(PRODUCT_CACHE_KEY);
        const cachedServiceData = localStorage.getItem(SERVICE_CACHE_KEY);

        if (cachedProductData) {
          const { data, timestamp } = JSON.parse(cachedProductData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setProductGroups(data);
          } else {
            fetchProducts();
          }
        } else {
          fetchProducts();
        }

        if (cachedServiceData) {
          const { data, timestamp } = JSON.parse(cachedServiceData);
          if (Date.now() - timestamp < CACHE_EXPIRY) {
            setServiceGroups(data);
          } else {
            fetchServices();
          }
        } else {
          fetchServices();
        }
      } catch (error) {
        console.error("Error loading cached data:", error);
        fetchProducts();
        fetchServices();
      }
    };

    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const products: ProductType[] = await response.json();

        const groups: Record<string, DropdownItem[]> = {};
        products.forEach(product => {
          if (!groups[product.group]) {
            groups[product.group] = [];
          }
          groups[product.group].push({
            name: product.name,
            href: `/products/${product._id}`,
            displayTitle: product.displayTitle
          });
        });

        setProductGroups(groups);
        localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify({
          data: groups,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services');
        const services: ServiceType[] = await response.json();

        const groups: Record<string, DropdownItem[]> = {};
        services.forEach(service => {
          if (!groups[service.group]) {
            groups[service.group] = [];
          }
          groups[service.group].push({
            name: service.name,
            href: `/services/${service._id}`,
            displayTitle: service.displayTitle
          });
        });

        setServiceGroups(groups);
        localStorage.setItem(SERVICE_CACHE_KEY, JSON.stringify({
          data: groups,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    loadCachedData();
  }, []);

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

    if (productDropdown.length > 0) {
      items.push({
        name: "PRODUCTS",
        href: "/products",
        icon: ShoppingCart,
        dropdown: productDropdown,
      });
    }

    const serviceDropdown: DropdownItem[] = [];
    Object.keys(serviceGroups).forEach(group => {
      serviceDropdown.push({
        name: group,
        href: `/services?activeGroup=${encodeURIComponent(group)}`,
      });
    });

    if (serviceDropdown.length > 0) {
      items.push({
        name: "SERVICES",
        href: "/services",
        icon: Settings,
        dropdown: serviceDropdown,
      });
    }

    return items;
  };

  const moreItems: NavItem[] = [
    { name: "ABOUT US", href: "/about" },
    { name: "CLIENTS", href: "/clients" },
    { name: "CAREERS", href: "/careers" },
  ];

  const extraInfo: ExtraInfoItem[] = [
    { icon: Phone, info: "+1 (555) 123-4567" },
    { icon: Mail, info: "info@example.com" },
  ];

  const navbarItems = getNavbarItems();

  return (
    <>
      <nav className="py-2 pb-3 text-black sticky top-0 bg-white shadow-lg z-50 xl:py-3 xl:pb-3.5">
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
                <div
                  className={`${oxanium.className} text-xl lg:text-lg xl:text-3xl 3xl:text-4xl 2xl font-bold text-green`}
                >
                  MECHVACC
                </div>
              </Link>
            </div>
            <div className="hidden lg:flex items-center space-x-6 lg:space-x-4">
              {navbarItems.map((item) => (
                <div key={item.name} className="relative group flex">
                  <Link
                    href={item.href}
                    className="xl:px-3 lg:px-2 px-2 py-3 rounded-md text-base lg:text-lg 3xl:text-xl font-medium hover:text-green flex items-center cursor-pointer transition-all duration-300"
                  >
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <ChevronDown size={16} className="mt-4 cursor-pointer" />
                  )}
                  {item.dropdown && (
                    <div className="absolute left-0 mt-12 w-52 rounded-xl shadow-lg bg-white border-2 border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                      <div className="py-1">
                        {item.dropdown.map((groupItem) => (
                          <div key={groupItem.name} className="relative group/nested">
                            <Link
                              href={groupItem.href}
                              className="px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between cursor-pointer transition-all duration-300 font-medium"
                            >
                              <span>{groupItem.name}</span>
                              <ChevronDown size={14} className="transform -rotate-90" />
                            </Link>
                            {item.name === "PRODUCTS" && productGroups[groupItem.name] && (
                              <div className="absolute left-full top-0 w-56 rounded-xl shadow-lg bg-white border-2 border-gray-200 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-300">
                                <div className="py-1">
                                  {productGroups[groupItem.name].map((product, index) => (
                                    <Link
                                      key={index}
                                      href={product.href}
                                      className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-green transition-all duration-300 cursor-pointer"
                                    >
                                      {product.displayTitle || product.name}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            )}
                            {item.name === "SERVICES" && serviceGroups[groupItem.name] && (
                              <div className="absolute left-full top-0 w-56 rounded-xl shadow-lg bg-white border-2 border-gray-200 opacity-0 invisible group-hover/nested:opacity-100 group-hover/nested:visible transition-all duration-300">
                                <div className="py-1">
                                  {serviceGroups[groupItem.name].map((service) => (
                                    <Link
                                      key={service.name}
                                      href={service.href}
                                      className="block px-4 py-2 text-sm hover:bg-gray-50 hover:text-green transition-all duration-300 cursor-pointer"
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
                  className="px-2 xl:px-3 py-3 text-lg rounded-md font-medium hover:text-green 3xl:text-xl cursor-pointer transition-all duration-300"
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
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50">
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

      {/* Mobile More Menu */}
      {isMoreOpen && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 bg-white shadow-lg p-4 space-y-4 z-40">
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
  );
};

export default Navbar;