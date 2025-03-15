"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminSignIn() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/admin");
    }
  }, [status, router]);

  const handleSignIn = async () => {
    await signIn("google");
  };

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <motion.div
          className="text-lg text-[var(--color-green)] font-mono tracking-wider"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <span className="animate-pulse">Initializing Mechvacc Administration Portal...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        className="bg-[var(--color-white)]/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 w-full max-w-md border-2 border-[var(--color-green)]/30 relative z-10 overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
       
        

       

        <motion.h1
          className="text-5xl font-extrabold text-[var(--color-green)] mb-8 text-center relative tracking-wider z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          Admin Authentication
        </motion.h1>

        <motion.p
          className="text-[var(--color-green)] mb-10 text-center text-base font-mono tracking-wide relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <span className="inline-block animate-text-glitch">Access Protocol: Google Authentication</span>
        </motion.p>

        <motion.button
          onClick={handleSignIn}
          className="w-full px-6 py-4 bg-green-gradient text-[var(--color-white)] rounded-xl font-semibold text-lg focus:outline-none relative overflow-hidden group z-10 cursor-pointer"
          whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(13, 172, 154, 0.8)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.545 10.51v3.88h5.745c-.232 1.24-.88 2.29-1.885 2.98v2.48h3.05c1.785-1.64 2.82-4.06 2.82-6.94 0-.66-.06-1.31-.17-1.94h-9.56z" fill="#FFFFFF" />
              <path d="M12 21.5c2.97 0 5.46-1.01 7.28-2.73l-3.05-2.48c-.84.56-1.91.89-3.23.89-2.49 0-4.6-1.68-5.35-3.94H4.51v2.48C6.32 19.49 8.81 21.5 12 21.5z" fill="#FFFFFF" />
              <path d="M6.65 13.56c-.18-.56-.28-1.16-.28-1.77s.1-1.21.28-1.77V7.54H4.51C3.89 8.79 3.5 10.21 3.5 11.79s.39 2.99 1.01 4.24l2.14-2.47z" fill="#FFFFFF" />
              <path d="M12 6.5c1.36 0 2.58.47 3.54 1.39l2.66-2.66C16.46 3.51 14.49 2.5 12 2.5c-3.19 0-5.68 2.01-7.49 5.04l2.14 2.47C7.4 8.18 9.51 6.5 12 6.5z" fill="#FFFFFF" />
            </svg>
            Enter with Google
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}