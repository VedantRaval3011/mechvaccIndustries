"use client";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

export default function MobileViewFooter() {
  const [openSection, setOpenSection] = useState("");

interface SectionToggle {
    (section: string): void;
}

const toggleSection: SectionToggle = (section) => {
    setOpenSection(openSection === section ? "" : section);
};

  return (
    <footer className="bg-grayBg text-black py-2 lg:hidden">
      {/* Services Section */}
      <div>
        <button
          className="w-full text-left py-3 border-b border-black flex px-2 justify-between"
          onClick={() => toggleSection("services")}>
          Services
          {openSection === "services" ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openSection === "services" && (
          <ul className="pl-4 py-2">
            <li>Lorem</li>
            <li>Ipsum</li>
            <li>Des</li>
            <li>All services</li>
          </ul>
        )}
      </div>

      {/* Products Section */}
      <div>
        <button
          className="w-full text-left py-2 border-b border-gray-700 px-2 flex justify-between"
          onClick={() => toggleSection("products")}>
          Products
          {openSection === "products" ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openSection === "products" && (
          <ul className="pl-4 py-2">
            <li>Lorem</li>
            <li>Ipsum</li>
            <li>Des</li>
            <li>All products</li>
          </ul>
        )}
      </div>

      {/* Contact Section */}
      <div>
        <button
          className="w-full text-left py-2 flex px-2 justify-between "
          onClick={() => toggleSection("contact")}>
          Contact
          {openSection === "contact" ? <ChevronUp /> : <ChevronDown />}
        </button>
        {openSection === "contact" && (
          <ul className="pl-4 py-2">
            <li>Phone: 123-456-7890</li>
            <li>Email: example@mail.com</li>
            <li>Address: 123 Street, City</li>
          </ul>
        )}
      </div>
    </footer>
  );
}
