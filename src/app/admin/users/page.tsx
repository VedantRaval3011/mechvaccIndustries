// app/components/admin/ManageUsers.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface EnquiryUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  message: string;
  country: string;
  createdAt: Date;
}

interface InterestedUser {
  _id: string;
  productId: string;
  productTitle: string;
  queries: { title: string; type: string; value: string }[];
  createdAt: Date;
}

export default function ManageUsers() {
  const [enquiryUsers, setEnquiryUsers] = useState<EnquiryUser[]>([]);
  const [interestedUsers, setInterestedUsers] = useState<InterestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const enquiryRes = await fetch('/api/enquiry/users');
        if (!enquiryRes.ok) throw new Error("Failed to fetch enquiry users");
        const enquiryData = await enquiryRes.json();
        setEnquiryUsers(enquiryData);

        const interestedRes = await fetch('/api/interested-users');
        if (!interestedRes.ok) throw new Error("Failed to fetch interested users");
        const interestedData = await interestedRes.json();
        setInterestedUsers(interestedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <motion.div
          animate={{  scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-[var(--color-green)] text-2xl font-futuristic"
        >
          <span className="flex items-center gap-2">
            <div className="w-5 h-5 bg-[var(--color-green)] rounded-full animate-pulse" />
            Initializing Data Matrix...
          </span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-2xl font-futuristic p-6 bg-red-100/50 backdrop-blur-md rounded-lg"
        >
          System Error: {error}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 py-12 px-4">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-6xl mx-auto mb-8"
      >
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-green)] hover:text-green-700 transition-colors bg-white/70 backdrop-blur-sm py-3 px-6 rounded-lg shadow-sm hover:shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Admin Dashboard
        </Link>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-green)] to-gray-700"
      >
        User Information 
      </motion.h1>

      {/* Enquiry Users Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto mb-16"
      >
        <h2 className="text-4xl font-semibold mb-6 text-[var(--color-green)]">All of your enquires</h2>
        <AnimatePresence>
          {enquiryUsers.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 italic text-xl"
            >
              No active enquiry nodes detected
            </motion.p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {enquiryUsers.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)"
                  }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200 hover:border-[var(--color-green)] transition-colors"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">
                    {user.firstname} {user.lastname}
                  </h3>
                  <div className="space-y-3 text-gray-700 text-base">
                    <p><span className="text-[var(--color-green)] font-medium">Email:</span> {user.email}</p>
                    <p><span className="text-[var(--color-green)] font-medium">Contact:</span> {user.country} {user.contact}</p>
                    <p><span className="text-[var(--color-green)] font-medium">Transmission:</span> {user.message}</p>
                    <p className="text-gray-500 text-lg">
                      <span className="text-[var(--color-green)] font-medium">Timestamp:</span> {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Interested Users Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="max-w-7xl mx-auto"
      >
        <h2 className="text-4xl font-semibold mb-6 text-[var(--color-green)]">Interest User Details</h2>
        <AnimatePresence>
          {interestedUsers.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-600 italic text-xl"
            >
              No interest nodes detected
            </motion.p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {interestedUsers.map((user) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 0 20px rgba(0, 255, 0, 0.2)"
                  }}
                  className="bg-white/80 backdrop-blur-md p-6 rounded-xl border border-gray-200 hover:border-[var(--color-green)] transition-colors"
                >
                  <h3 className="text-2xl font-semibold text-gray-800 mb-3">{user.productTitle}</h3>
                  <div className="space-y-3 text-gray-700 text-base">
                    <p><span className="text-[var(--color-green)] font-medium">Product ID:</span> {user.productId}</p>
                    <div>
                      <span className="text-[var(--color-green)] font-medium">Data Points:</span>
                      <ul className="mt-2 space-y-2">
                        {user.queries.map((query, idx) => (
                          <li key={idx} className="text-gray-700">
                            <span className="text-[var(--color-green)] font-medium">{query.title}:</span>{" "}
                            {query.value || "Not specified"}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-gray-500 text-lg">
                      <span className="text-[var(--color-green)] font-medium">Timestamp:</span> {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}