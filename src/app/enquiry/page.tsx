"use client";

import { Mail, MapPinHouse, PhoneCall } from "lucide-react";
import Image from "next/image";
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

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("Transmission successful!");
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
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error) {
      toast.error(`Transmission failed: ${error}`);
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-green-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      {/* Header */}
      <motion.div
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative h-72 md:h-96 lg:h-[28rem]"
      >
        <Image
          src="/group (1).png"
          width={1000}
          height={1000}
          quality={100}
          alt="group"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-green-200/30 to-white/80" />
        <motion.h1
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 60, delay: 0.3 }}
          className="absolute inset-0 flex items-center justify-end pr-12 lg:pr-64 text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-green-700 drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]"
        >
          ENQUIRY PROTOCOL
        </motion.h1>
        <motion.div
          className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-green-600 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        />
      </motion.div>

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
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-green-400/20 rounded-full blur-2xl animate-pulse delay-500" />
            <h1 className="text-4xl lg:text-6xl font-extrabold mb-8 bg-gradient-to-r from-green-500 to-green-700 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">
              Connect with Us
            </h1>
            <p className="text-gray-700 lg:text-xl mb-10 leading-relaxed font-light tracking-wide">
              Link into our eco-network. Your signals power the future—we’re
              ready to amplify them.
            </p>
            <div className="space-y-10">
              {[
                {
                  icon: MapPinHouse,
                  text: "Sector 1055, Lorem Quadrant, Elk Groot System",
                },
                { icon: PhoneCall, text: "+1 234 678 9108 99" },
                { icon: Mail, text: "Contact@mechvacc.com" },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex items-center gap-5 group"
                  whileHover={{ x: 10 }}
                >
                  <div className="p-4 bg-green-500/20 rounded-full group-hover:bg-green-500/40 group-hover:shadow-[0_0_15px_rgba(34,197,94,0.5)] transition-all duration-300">
                    <item.icon className="text-green-600" size={30} />
                  </div>
                  <p className="font-medium text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            variants={itemVariants}
            className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-10 shadow-[0_0_30px_rgba(34,197,94,0.1)] border border-green-500/30"
          >
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-green-300/15 rounded-full blur-3xl animate-pulse delay-700" />
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {["firstname", "lastname"].map((field) => (
                  <motion.input
                    key={field}
                    variants={itemVariants}
                    type="text"
                    name={field}
                    placeholder={`${field === "firstname" ? "First" : "Last"} Name*`}
                    className="w-full p-4 rounded-xl bg-gray-50/80 border border-green-500/30 focus:outline-none focus:border-green-600 focus:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-green-500/50"
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
                placeholder="Your Email*"
                className="w-full p-4 rounded-xl bg-gray-50/80 border border-green-500/30 focus:outline-none focus:border-green-600 focus:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-green-500/50"
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
                  className="p-4 rounded-xl bg-gray-50/80 border border-green-500/30 focus:outline-none focus:border-green-600 focus:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-gray-900 transition-all duration-300 hover:border-green-500/50"
                >
                  <option value="" className="bg-gray-50">
                    Select Region
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
                  placeholder="Contact Code*"
                  className="w-full p-4 rounded-xl bg-gray-50/80 border border-green-500/30 focus:outline-none focus:border-green-600 focus:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-green-500/50"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  pattern="[0-9]*"
                />
              </motion.div>

              <motion.textarea
                variants={itemVariants}
                name="message"
                placeholder="Your Transmission*"
                className="w-full p-4 rounded-xl bg-gray-50/80 border border-green-500/30 focus:outline-none focus:border-green-600 focus:shadow-[0_0_15px_rgba(34,197,94,0.4)] text-gray-900 placeholder-gray-400 transition-all duration-300 hover:border-green-500/50 min-h-[160px] resize-none"
                required
                value={formData.message}
                onChange={handleChange}
                whileFocus={{ scale: 1.02 }}
              />

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isSubmitting}
                className="w-full p-4 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-xl font-semibold relative overflow-hidden group shadow-[0_0_20px_rgba(34,197,94,0.5)] disabled:opacity-60"
                whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,197,94,0.7)" }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">
                  {isSubmitting ? "Transmitting..." : "Send Transmission"}
                </span>
                <motion.div
                  className="absolute inset-0 bg-green-400/40"
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