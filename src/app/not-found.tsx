// app/not-found.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";

// Predefined orb configurations to avoid random values during SSR
const orbConfigs = [
  { size: 15, x: "10%", y: "20%" },
  { size: 25, x: "20%", y: "80%" },
  { size: 18, x: "30%", y: "40%" },
  { size: 22, x: "40%", y: "60%" },
  { size: 20, x: "50%", y: "30%" },
  { size: 17, x: "60%", y: "70%" },
  { size: 23, x: "70%", y: "50%" },
  { size: 19, x: "80%", y: "90%" },
  { size: 16, x: "90%", y: "10%" },
  { size: 24, x: "15%", y: "55%" },
  { size: 21, x: "25%", y: "35%" },
  { size: 26, x: "35%", y: "75%" },
  { size: 14, x: "45%", y: "25%" },
  { size: 27, x: "55%", y: "85%" },
  { size: 13, x: "65%", y: "15%" },
];

export default function NotFound() {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.4 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const numberVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: {
      scale: [1, 1.05, 1],
      rotate: [0, 2, -2, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-green-bg)] overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(0,0,0,0.1)_1px,transparent_1px),linear-gradient(to_right,rgba(0,0,0,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />

        {/* Floating Orbs */}
        {orbConfigs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[var(--color-green)]/20 blur-sm"
            style={{ width: orb.size, height: orb.size }}
            initial={{ x: orb.x, y: orb.y }}
            animate={{
              y: [0, -150, 0],
              opacity: [0, 0.5, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + i * 0.5, // Staggered durations
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}

        {/* Holographic Rings */}
        <motion.div
          className="absolute w-64 h-64 rounded-full border-2 border-[var(--color-green)]/30"
          style={{ top: "20%", left: "10%" }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full border-2 border-[var(--color-green)]/20"
          style={{ bottom: "15%", right: "15%" }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center p-8 max-w-lg mx-auto relative z-10"
      >
        {/* Futuristic 404 with Hologram Effect */}
        <motion.div
          className="relative"
          variants={numberVariants}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-9xl md:text-[10rem] font-bold bg-gradient-to-r from-[var(--color-green-gradient-start)] to-[var(--color-green-gradient-end)] text-transparent bg-clip-text drop-shadow-[0_0_20px_rgba(75,180,156,0.3)]">
            404
          </h1>
          <div className="absolute inset-0 bg-[var(--color-green)]/10 blur-md animate-pulse" />
        </motion.div>

        {/* Title with Neon Effects */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-4xl font-semibold text-[var(--color-black)] mt-6 mb-6 relative"
        >
          <span className="relative inline-block">
            Dimensional Rift Detected
            <span className="absolute -top-2 -right-2 w-3 h-3 rounded-full bg-[var(--color-green)] animate-ping" />
            <span className="absolute inset-0 text-[var(--color-green)] blur-sm opacity-50">
              Dimensional Rift Detected
            </span>
          </span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-[var(--color-black)]/80 mb-8 text-lg relative z-10 bg-[var(--color-green-bg)]/80 p-2 rounded-lg"
        >
          System Error: This Page is under reconstruction or your entered link
          is misaligned.
        </motion.p>

        {/* Fancy Portal-like Button */}
        <motion.div variants={itemVariants}>
          <Link
            href="/"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="inline-block px-8 py-4 rounded-full text-[var(--color-white)] font-medium relative overflow-hidden group"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-[var(--color-large-green-gradient-start)] to-[var(--color-large-green-gradient-end)]"
              animate={{
                scale: isHovered ? 1.2 : 1,
                rotate: isHovered ? 360 : 0,
              }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute inset-0 border-2 border-[var(--color-green)] rounded-full"
              animate={{ scale: isHovered ? [1.1, 1] : 1 }}
              transition={{ duration: 0.3 }}
            />
            <motion.span
              className="relative z-10 flex items-center gap-2"
              animate={{ x: isHovered ? 8 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <motion.span
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
                </svg>
              </motion.span>
              <span>Move to Home (Mechvacc Industries)</span>
            </motion.span>
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom Cyber Grid */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[var(--color-green)]/30 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      >
        <div className="absolute bottom-0 w-full h-1 bg-[var(--color-green)] animate-pulse" />
      </motion.div>

      {/* Side Tech Lines */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-green)]/50"
        animate={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        className="absolute right-0 top-0 bottom-0 w-1 bg-[var(--color-green)]/50"
        animate={{ scaleY: [0, 1, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </div>
  );
}
