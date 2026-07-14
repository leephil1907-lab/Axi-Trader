"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }} className="text-8xl font-black text-[#D31C2B] mb-4">404</motion.div>
        <h1 className="text-2xl font-black text-white mb-2">Page Not Found</h1>
        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">The page you are looking for does not exist or has been moved.</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/">
            <motion.button whileTap={{ scale: 0.97 }} className="px-6 py-3 bg-[#F5C842] text-[#1A1A1A] font-bold text-sm rounded-xl flex items-center gap-2">
              <Home size={16} /> Back to Home
            </motion.button>
          </Link>
          <Link href="/helpcenter/">
            <motion.button whileTap={{ scale: 0.97 }} className="px-6 py-3 border border-white/20 text-white font-bold text-sm rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors">
              <Search size={16} /> Help Center
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
