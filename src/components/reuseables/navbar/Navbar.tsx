"use client";
import React, { useState } from "react";
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
} from "lucide-react";

const oxanium = Oxanium({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

const Navbar = () => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const navbarItems = [
    { name: "HOME", href: "/", icon: Home },
    {
      name: "PRODUCTS",
      href: "/products",
      icon: ShoppingCart,
      dropdown: [
        { name: "Tanks", href: "/products/?selectedCategory=Tank" },
        { name: "Plants", href: "/products/?selectedCategory=Tank" },
        { name: "Fittings", href: "/products/?selectedCategory=Fittings" },
      ],
    },
    {
      name: "SERVICES",
      href: "/services",
      icon: Settings,
      dropdown: [
        { name: "Lorem Ipsum 4", href: "/services/1" },
        { name: "Lorem Ipsum 5", href: "/services/2" },
        { name: "Lorem Ipsum 6", href: "/services/3" },
      ],
    },
  ];

  const moreItems = [
    { name: "ABOUT US", href: "/about" },
    { name: "CLIENTS", href: "/clients" },
    { name: "CAREERS", href: "/careers" },
  ];

  const ExtraInfo = [
    { icon: Phone, info: "+1 (555) 123-4567" },
    { icon: Mail, info: "info@example.com" },
  ];

  return (
    <>
      <nav className="py-2 pb-3 text-black sticky top-0 bg-white shadow-lg z-50 xl:py-3 xl:pb-3.5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-2">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 lg:gap-1">
              <Image
                src="/mechvacc-logo.png"
                height={50}
                width={50}
                alt="Mechvacc Logo"
              />
              <div
                className={`${oxanium.className} text-xl lg:text-lg xl:text-3xl 3xl:text-4xl 2xl font-bold text-green`}>
                MECHVACC
              </div>
            </div>
            <div className="hidden lg:flex items-center space-x-6 lg:space-x-4">
              {navbarItems.map((item) => (
                <div key={item.name} className="relative group flex">
                  <Link
                    href={item.href}
                    className="xl:px-3 lg:px-2 px-2 py-3 rounded-md text-base lg:text-lg 3xl:text-xl font-light hover:text-green flex items-center">
                    {item.name}
                  </Link>
                    {item.dropdown && (
                      <ChevronDown size={16} className="mt-4" />
                    )}
                  {item.dropdown && (
                    <div className="absolute left-0 mt-12 w-48 rounded-md shadow-lg bg-white ring-1  ring-green ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                      <div className="py-1">
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            href={dropdownItem.href}
                            className="block px-4 py-2 text-sm text-green hover:bg-gray-100">
                            {dropdownItem.name}
                          </Link>
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
                  className="px-2 xl:px-3 py-3 text-lg rounded-md font-light hover:text-green 3xl:text-xl">
                  {item.name}
                </Link>
              ))}
            </div>
            <Link href="/enquiry">
              <div className="md:block">
                <button className="px-3 py-2 bg-green-gradient text-center text-base lg:text-base xl:text-lg rounded-xl text-white flex items-center gap-2 lg:px-5 lg:py-2.5 xl:mr-8 3xl:text-xl 3xl:px-6 3xl:py-3.5" >
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
              className="flex flex-col items-center justify-center w-full h-full hover:text-green">
              <item.icon size={24} />
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center w-full h-full hover:text-green">
            <MoreHorizontal size={24} />
            <span className="text-xs mt-1">MORE</span>  
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
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-green"
              onClick={() => setIsMoreOpen(false)}>
              {item.name}
            </Link>
          ))}
          <div className="border-t border-gray-200 pt-4 mt-4">
            {ExtraInfo.map((item, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 mb-2 text-green">
                <item.icon size={16} />
                <span>{item.info}</span>
              </div>
            ))}
          </div> 
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind the bottom nav on mobile */}
    </>
  );
};

export default Navbar;
