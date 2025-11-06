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

    const processingToastId = toast.info("Processing your enquiry...", {
      autoClose: false,
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
        toast.update(processingToastId, {
          render: "Your enquiry has been submitted successfully.",
          type: "success",
          autoClose: 5000,
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
        toast.update(processingToastId, {
          render: `Submission error: ${errorData.message}`,
          type: "error",
          autoClose: 5000,
        });
      }
    } catch (error) {
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
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-['Inter',sans-serif] py-16 lg:py-24">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 lg:px-12"
      >
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Info - 2 columns */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Get in Touch
              </h1>
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                Have questions or need assistance? We're here to help. Reach out to our team and we'll respond promptly.
              </p>
            </div>

            <div className="space-y-6 pt-4">
              {[
                {
                  icon: MapPinHouse,
                  label: "Address",
                  text: "Sector 1055, Lorem Quadrant, Elk Groot System",
                },
                { 
                  icon: PhoneCall, 
                  label: "Phone",
                  text: "+1 234 678 9108 99" 
                },
                { 
                  icon: Mail, 
                  label: "Email",
                  text: "contact@mechvacc.com" 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-start gap-4 group"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-[var(--color-green)]/10 rounded-lg flex items-center justify-center group-hover:bg-[var(--color-green)]/20 transition-colors duration-300">
                    <item.icon className="text-[var(--color-green)] w-5 h-5" strokeWidth={2} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">{item.label}</p>
                    <p className="text-gray-900 font-medium">{item.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form - 3 columns */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-3 bg-white rounded-2xl p-8 lg:p-10 shadow-sm border border-gray-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {["firstname", "lastname"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field === "firstname" ? "First Name" : "Last Name"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name={field}
                      placeholder={`Enter your ${field === "firstname" ? "first" : "last"} name`}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200"
                      required
                      value={formData[field as keyof FormData]}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleCountryChange}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent text-gray-900 transition-all duration-200"
                  >
                    <option value="">Select</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200"
                    required
                    value={formData.contact}
                    onChange={handleChange}
                    pattern="[0-9]*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  placeholder="Tell us how we can help you..."
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-green)] focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200 min-h-[140px] resize-none"
                  required
                  value={formData.message}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3.5 bg-[var(--color-green)] hover:bg-[var(--color-green)]/90 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isSubmitting ? "Submitting..." : "Submit Enquiry"}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
