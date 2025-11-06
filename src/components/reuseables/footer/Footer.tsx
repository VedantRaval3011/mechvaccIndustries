"use client";
import { Facebook, House, Instagram, Mail, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { memo, useMemo, useState, useEffect, useCallback } from "react";
import MobileViewFooter from "../home/MobileFooter";
import PolicyFooter from "../home/PolicyFooter";

// Types
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

// Utility function
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Memoized social media icons component
const SocialIcons = memo(() => {
  const socialLinks = useMemo(() => [
    { Icon: Twitter, href: "#", label: "Twitter" },
    { Icon: Instagram, href: "#", label: "Instagram" },
    { Icon: Facebook, href: "#", label: "Facebook" },
  ], []);

  return (
    <div className="flex gap-4">
      {socialLinks.map(({ Icon, href, label }) => (
        <Link
          key={label}
          href={href}
          className="hover:opacity-80 transition-opacity duration-200"
          aria-label={label}
        >
          <Icon size={24} />
        </Link>
      ))}
    </div>
  );
});

SocialIcons.displayName = 'SocialIcons';

// Memoized contact info component
const ContactInfo = memo(() => {
  const contactItems = useMemo(() => [
    { Icon: Phone, text: "123-456-7890", href: "tel:123-456-7890" },
    { Icon: Mail, text: "example@mail.com", href: "mailto:example@mail.com" },
    { Icon: House, text: "123 Street, City", href: "#" },
  ], []);

  return (
    <div>
      <h2 className="text-lg">Contact</h2>
      <ul className="py-2 space-y-2">
        {contactItems.map(({ Icon, text, href }) => (
          <li key={text} className="flex items-center gap-2">
            <Icon size={16} />
            {href.startsWith('#') ? (
              <span>{text}</span>
            ) : (
              <Link href={href} className="hover:underline">
                {text}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
});

ContactInfo.displayName = 'ContactInfo';

// Memoized navigation section component
const NavigationSection = memo(({ title, items, basePath }: { title: string; items: string[]; basePath: string }) => (
  <div>
    <h2>{title}</h2>
    <ul className="py-2">
      {items.map((item) => (
        <li key={item}>
          <Link href={`${basePath}/${createSlug(item)}`} className="hover:underline">
            {item}
          </Link>
        </li>
      ))}
      <li>
        <Link href={basePath} className="hover:underline">
          All {title}
        </Link>
      </li>
    </ul>
  </div>
));

NavigationSection.displayName = 'NavigationSection';

// Memoized action buttons component
const ActionButtons = memo(() => {
  const buttons = useMemo(() => [
    { text: "Brouchure", href: "#" },
    { text: "Book a Call", href: "#" },
  ], []);

  return (
    <div className="flex items-center justify-center mt-12 lg:mt-1 lg:items-center gap-16 lg:mx-4">
      {buttons.map(({ text, href }) => (
        <Link key={text} href={href}>
          <button className="bg-green-gradient rounded-2xl px-4 py-2 uppercase text-white text-lg hover:opacity-90 transition-opacity duration-200">
            {text}
          </button>
        </Link>
      ))}
      <Image
        width={150}
        height={150}
        alt="Mechvacc Logo Background"
        src="/mechvacc-logo.png"
        className="absolute -z-10 opacity-25"
        style={{
          filter: "drop-shadow(5px 5px 10px rgba(0, 0, 0, 0.5))",
        }}
        priority={false}
      />
    </div>
  );
});

ActionButtons.displayName = 'ActionButtons';

const Footer = memo(() => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch('/api/products', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  // Fetch services
  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch('/api/services', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setServices(data);
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        await Promise.allSettled([
          fetchProducts(),
          fetchServices()
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchProducts, fetchServices]);

  // Get first 4 product names
  const productItems = useMemo(() => {
    return products.slice(0, 4).map(p => p.displayTitle || p.name);
  }, [products]);

  // Get first 4 service names
  const serviceItems = useMemo(() => {
    return services.slice(0, 4).map(s => s.displayTitle || s.name);
  }, [services]);

  return (
    <div className="relative h-[85vh] lg:h-[60vh] xl:h-[35vh] flex flex-col">
      <div className="flex-grow flex flex-col">
        {/* Header Section */}
        <div className="flex pt-6 justify-between px-2 text-white bg-large-green-gradient">
          <div className="flex flex-col gap-9">
            <h1 className="lg:text-xl">
              Lorem ipsum dolor sit amet, <br /> consectetur adipiscing elit.
            </h1>
            <SocialIcons />
          </div>
          <div className="flex flex-col justify-evenly gap-6 items-center h-32 mr-2">
            <Link
              href="/about"
              className="bg-white rounded-2xl shadow-lg text-sm p-2 hover:shadow-xl transition-shadow duration-200"
            >
              <button className="text-black xl:text-xl">About Us</button>
            </Link>
            <div className="flex mr-2 gap-1 justify-center items-center">
              <Image
                width={25}
                height={25}
                alt="Mechvacc Logo"
                src="/mechvacc-logo.png"
                className="brightness-0 invert"
              />
              <p className="uppercase text-center">Mechvacc</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col lg:flex-row gap-2 lg:items-center justify-between">
          <MobileViewFooter />
          
          {/* Desktop Navigation */}
          <div 
            className="hidden lg:flex gap-5 text-sm mx-3 xl:text-lg md:mt-8 font-light" 
            style={{ 
              WebkitFontSmoothing: 'none', 
              textRendering: 'optimizeLegibility',
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-pulse">
                  <h2>Products</h2>
                  <div className="py-2 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="animate-pulse">
                  <h2>Services</h2>
                  <div className="py-2 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-28"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavigationSection title="Products" items={productItems} basePath="/products" />
                <NavigationSection title="Services" items={serviceItems} basePath="/services" />
              </>
            )}
            <ContactInfo />
          </div>
          
          <ActionButtons />
        </div>
      </div>
      
      {/* Footer Policy */}
      <div className="mt-auto pb-20 lg:pb-0">
        <PolicyFooter />
      </div>
    </div>
  );
});

Footer.displayName = 'Footer';

export default Footer;