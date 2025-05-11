import { motion } from "framer-motion";
import { Clock, Mail } from "lucide-react";

export const metadata = {
  title: "Maintenance | Your Site",
  description:
    "Our website is currently under maintenance. We'll be back soon!",
  robots: "noindex",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Clock className="w-16 h-16 text-[var(--color-green)] mx-auto mb-4" />
        </motion.div>
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
            className="inline-flex items-center px-6 py-3 bg-[var(--color-green)] text-white font-semibold rounded-full hover:bg-[var(--color-green-gradient-end)] transition-all duration-300"
          >
            <Mail className="w-5 h-5 mr-2" />
            Contact Support
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour
