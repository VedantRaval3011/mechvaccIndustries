'use client'; // Mark this as a client component

import { useEffect, useState } from 'react';
import { Clock, Mail } from "lucide-react";


export default function MaintenancePage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div 
        className={`max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 transition-opacity duration-800 ${isClient ? 'opacity-100' : 'opacity-0'}`}
        style={{ transform: isClient ? 'translateY(0)' : 'translateY(20px)' }}
      >
        <div
          className="transition-transform duration-500 ease-out"
          style={{ transform: isClient ? 'scale(1)' : 'scale(0.8)' }}
        >
          <Clock className="w-16 h-16 text-[#49b195] mx-auto mb-4" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          We&apos;re Under Maintenance
        </h1>
        <p className="text-lg text-gray-600">
          Our website is currently undergoing scheduled maintenance to bring you
          a better experience.
        </p>
        <p className="text-md text-gray-500 font-medium">
          Expected downtime: Up to 7 days from May 11, 2025
        </p>
        <div className="flex justify-center">
          <a
            href="mailto:mechvacc@gmail.com"
            className="inline-flex items-center px-6 py-3 bg-[#49b195] text-white font-semibold rounded-full hover:bg-[#388E3C] transition-all duration-300"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
