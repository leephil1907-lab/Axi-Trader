"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, ArrowLeftRight, Wallet, Settings } from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/markets/", icon: Compass, label: "Markets" },
  { href: "/trading/", icon: ArrowLeftRight, label: "Trade" },
  { href: "/wallet/", icon: Wallet, label: "Wallet" },
  { href: "/settings/", icon: Settings, label: "Settings" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#D9D3CB] px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href.slice(0, -1));
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1 py-1 px-3">
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -top-2 w-8 h-1 bg-[#D31C2B] rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <item.icon size={20} className={isActive ? "text-[#D31C2B]" : "text-[#9B9590]"} />
              <span className={`text-[10px] font-bold ${isActive ? "text-[#D31C2B]" : "text-[#9B9590]"}`}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
