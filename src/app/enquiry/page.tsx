"use client";

import { Mail, MapPinHouse, PhoneCall } from "lucide-react";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

interface FormData {
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  message: string;
  country: string;
}

const countries = [
  { code: "+1", name: "USA" },
  { code: "+91", name: "India" },
  { code: "+44", name: "UK" },
] as const;

export default function EnquiryPage() {
  const [formData, setFormData] = useState<FormData>({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    message: "",
    country: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      country: e.target.value,
      contact: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Show processing toast
    const processingToastId = toast.info("Processing your enquiry...", {
      autoClose: false, // Keep it open until updated
    });

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Update toast to success
        toast.update(processingToastId, {
          render: "Your enquiry has been submitted successfully.",
          type: "success",
          autoClose: 5000, // Close after 5 seconds
        });
        setFormData({
          firstname: "",
          lastname: "",
          email: "",
          message: "",
          contact: "",
          country: "",
        });
      } else {
        const errorData = await res.json();
        // Update toast to error
        toast.update(processingToastId, {
          render: `Submission error: ${errorData.message}`,
          type: "error",
          autoClose: 5000,
        });
      }
    } catch (error) {
      // Update toast to error
      toast.update(processingToastId, {
        render: `Submission failed: ${error instanceof Error ? error.message : "An unexpected error occurred"}`,
        type: "error",
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.4,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 60, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-100 to-gray-200 text-gray-900 pb-20 overflow-hidden relative">
      {/* Light-themed background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[var(--color-green)]/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-[var(--color-green)]/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 lg:px-20 mt-16 lg:mt-24 relative z-10"
      >
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="relative">
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-[var(--color-green)]/20 rounded-full blur-2xl animate-pulse delay-500" />
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-8 bg-gradient-to-r from-[var(--color-green)] to-[var(--color-green)]/70 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(var(--color-green-rgb),0.3)]">
              Contact Us
            </h1>
            <p className="text-gray-700 lg:text-xl mb-10 leading-relaxed font-light tracking-wide">
              We value your interest in our services. Please feel free to reach out with any questions or inquiries—we are here to assist you.
            </p>
            <div className="space-y-10">
              {[
                {
                  icon: MapPinHouse,
                  text: "Sector 1055, Lorem Quadrant, Elk Groot System",
                },
                { icon: PhoneCall, text: "+1 234 678 9108 99" },
                { icon: Mail, text: "contact@mechvacc.com" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-5 group"
                  whileHover={{ x: 10 }}
                >
                  <div className="p-4 bg-[var(--color-green)]/20 rounded-full group-hover:bg-[var(--color-green)]/40 group-hover:shadow-[0_0_15px_rgba(var(--color-green-rgb),0.5)] transition-all duration-300">
                    <item.icon className="text-[var(--color-green)]" size={30} />
                  </div>
                  <p className="font-medium text-gray-800 group-hover:text-[var(--color-green)] transition-colors duration-300">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_30px_rgba(var(--color-green-rgb),0.1)] border border-[var(--color-green)]/30"
          >
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-[var(--color-green)]/15 rounded-full blur-3xl animate-pulse delay-700" />
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {["firstname", "lastname"].map((field) => (
                  <motion.input
                    key={field}
                    variants={itemVariants}
                    type="text"
                    name={field}
                    placeholder={`${field === "firstname" ? "First" : "Last"} Name*`}
                    className="w-full p-4 rounded-xl bg-gray-50/80 border border-[var(--color-green)]/30 focus:outline-none focus:border-[var(--color-green)] focus:shadow-[0_0_15px_rgba(var(--color-green-rgb),0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-[var(--color-green)]/50"
                    required
                    value={formData[field as keyof FormData]}
                    onChange={handleChange}
                    whileFocus={{ scale: 1.02 }}
                  />
                ))}
              </div>

              <motion.input
                variants={itemVariants}
                type="email"
                name="email"
                placeholder="Email Address*"
                className="w-full p-4 rounded-xl bg-gray-50/80 border border-[var(--color-green)]/30 focus:outline-none focus:border-[var(--color-green)] focus:shadow-[0_0_15px_rgba(var(--color-green-rgb),0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-[var(--color-green)]/50"
                required
                value={formData.email}
                onChange={handleChange}
                whileFocus={{ scale: 1.02 }}
              />

              <motion.div variants={itemVariants} className="flex gap-6">
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleCountryChange}
                  required
                  className="p-4 rounded-xl bg-gray-50/80 border border-[var(--color-green)]/30 focus:outline-none focus:border-[var(--color-green)] focus:shadow-[0_0_15px_rgba(var(--color-green-rgb),0.4)] text-gray-900 transition-all duration-300 hover:border-[var(--color-green)]/50"
                >
                  <option value="" className="bg-gray-50">
                    Select Country
                  </option>
                  {countries.map((country) => (
                    <option
                      key={country.code}
                      value={country.code}
                      className="bg-gray-50"
                    >
                      {country.name} ({country.code})
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="contact"
                  placeholder="Phone Number*"
                  className="w-full p-4 rounded-xl bg-gray-50/80 border border-[var(--color-green)]/30 focus:outline-none focus:border-[var(--color-green)] focus:shadow-[0_0_15px_rgba(var(--color-green-rgb),0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-[var(--color-green)]/50"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  pattern="[0-9]*"
                />
              </motion.div>

              <motion.textarea
                variants={itemVariants}
                name="message"
                placeholder="Your Message*"
                className="w-full p-4 rounded-xl bg-gray-50/80 border border-[var(--color-green)]/30 focus:outline-none focus:border-[var(--color-green)] focus:shadow-[0_0_15px_rgba(var(--color-green-rgb),0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-[var(--color-green)]/50 min-h-[160px] resize-none"
                required
                value={formData.message}
                onChange={handleChange}
                whileFocus={{ scale: 1.02 }}
              />

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isSubmitting}
                className="w-full p-4 bg-gradient-to-r from-[var(--color-green)] to-[var(--color-green)]/70 text-white rounded-xl font-semibold relative overflow-hidden group shadow-[0_0_20px_rgba(var(--color-green-rgb),0.5)] disabled:opacity-60"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(var(--color-green-rgb),0.7)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Submitting..." : "Submit Enquiry"}
                </span>
                <motion.div
                  className="absolute inset-0 bg-[var(--color-green)]/40"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 2, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}