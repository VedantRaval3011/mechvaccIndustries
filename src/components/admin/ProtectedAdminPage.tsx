import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

function ProtectedAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/signin");
    }
  }, [status, router]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 70 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const floatVariants = {
    animate: {
      y: [0, -25, 0],
      rotate: [0, 10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.1 }}
          transition={{ duration: 0.7, repeat: Infinity, repeatType: "reverse" }}
          className="text-green-400 font-mono text-xl sm:text-2xl md:text-3xl tracking-widest"
        >
          System Booting...
        </motion.div>
      </div>
    );
  }

  if (status === "authenticated" && session) {
    return (
      <div className="min-h-[91vh] bg-white flex flex-col items-center justify-center relative overflow-hidden py-8 sm:py-12">
        {/* Futuristic Background Elements */}
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute top-10 left-10 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-green-400/20 to-blue-500/20 rounded-full blur-2xl"
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute bottom-10 right-10 w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 bg-gradient-to-br from-purple-500/20 to-green-400/20 rounded-xl blur-xl rotate-45"
        />
        <motion.div
          variants={floatVariants}
          animate="animate"
          className="absolute top-1/3 left-1/4 w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 bg-gradient-to-br from-blue-500/10 to-green-400/10 rounded-full blur-lg"
        />

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center z-10 w-full max-w-3xl sm:max-w-4xl p-6 sm:p-8 md:p-12 rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-100/30"
        >
          {/* Header */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-light text-gray-800 tracking-wide mb-3 sm:mb-4"
          >
            Admin Command Center
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base md:text-lg text-gray-500 mb-6 sm:mb-10 tracking-wide"
          >
            Manage your ecosystem with precision and control
          </motion.p>

          {/* Navigation Panel */}
          <motion.div
            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 border border-gray-200/70 shadow-lg flex flex-col sm:flex-row sm:justify-center gap-6 sm:gap-12 mb-8 sm:mb-12"
            whileHover={{ scale: 1.025 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            {[
              { title: "Add Product", path: "/admin/addProduct" },
              { title: "Add Service", path: "/admin/addService" },
              { title: "Manage Users", path: "/admin/users" },
            ].map((link) => (
              <motion.h2
                key={link.title}
                variants={itemVariants}
                whileHover={{
                  y: -8,
                  color: "#00E676",
                  textShadow: "0 0 15px rgba(0, 230, 118, 0.6)",
                }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer font-semibold text-lg sm:text-xl md:text-2xl text-gray-700 tracking-wider hover:font-bold transition-all duration-300"
                onClick={() => router.push(link.path)}
              >
                {link.title}
              </motion.h2>
            ))}
          </motion.div>

          {/* Welcome Message & Info */}
          <motion.h2
            variants={itemVariants}
            className="text-xl sm:text-2xl md:text-3xl font-light text-gray-800 tracking-tight mb-3 sm:mb-4"
          >
            Welcome,{" "}
            <motion.span
              className="text-green-400 font-medium"
              animate={{ scale: [1, 1.05, 1], opacity: [1, 0.85, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            >
              {session.user?.name}
            </motion.span>
            <span className="text-gray-500">!</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-600 tracking-wide"
          >
            Your dashboard is ready. Take charge of operations and shape the future.
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return null;
}

export default ProtectedAdminPage;