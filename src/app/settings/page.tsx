"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Bell, Shield, Globe, Moon, Smartphone, Mail,
  ChevronRight, LogOut, Key, Fingerprint, CreditCard, FileText, HelpCircle
} from "lucide-react";
import { LANGUAGES, CURRENCIES } from "@/lib/countries";
import LiveChatBot from "@/components/LiveChatBot";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({ trade: true, price: true, deposit: true, marketing: false });
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("EUR");
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === language);
  const selectedCurrency = CURRENCIES.find((c) => c.code === currency);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Settings</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        {/* Profile Card */}
        <div className="p-4 bg-[#1A1A1A] rounded-2xl mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#D31C2B] flex items-center justify-center text-white text-lg font-black">JD</div>
          <div>
            <p className="text-base font-bold text-white">John Doe</p>
            <p className="text-xs text-white/50">john.doe@example.com</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-[#22A958]/20 text-[#22A958] text-[9px] font-bold rounded uppercase">Verified</span>
          </div>
          <Link href="/login/" className="ml-auto">
            <motion.button whileTap={{ scale: 0.95 }} className="p-2 rounded-xl bg-[#333] text-white/60 hover:text-white transition-colors">
              <LogOut size={16} />
            </motion.button>
          </Link>
        </div>

        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Account</h3>
          <div className="space-y-1">
            <Link href="/helpcenter/">
              <button className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><User size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Personal Information</p><p className="text-[10px] text-[#9B9590]">Update your profile details</p></div>
                <ChevronRight size={16} className="text-[#D9D3CB]" />
              </button>
            </Link>
            <button className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><CreditCard size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Payment Methods</p><p className="text-[10px] text-[#9B9590]">Manage your payment options</p></div>
              <ChevronRight size={16} className="text-[#D9D3CB]" />
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><FileText size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Documents</p><p className="text-[10px] text-[#9B9590]">KYC and verification documents</p></div>
              <ChevronRight size={16} className="text-[#D9D3CB]" />
            </button>
          </div>
        </div>

        {/* Preferences */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Preferences</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Globe size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Language</p><p className="text-[10px] text-[#9B9590]">{selectedLang?.label}</p></div>
              <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-[#1A1A1A] outline-none border border-[#D9D3CB]">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><CreditCard size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Currency</p><p className="text-[10px] text-[#9B9590]">{selectedCurrency?.label}</p></div>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-[#1A1A1A] outline-none border border-[#D9D3CB]">
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Moon size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Dark Mode</p><p className="text-[10px] text-[#9B9590]">Switch between light and dark theme</p></div>
              <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? "bg-[#D31C2B]" : "bg-[#D9D3CB]"}`}>
                <motion.div className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ left: darkMode ? "22px" : "2px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Security</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Key size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Two-Factor Authentication</p><p className="text-[10px] text-[#9B9590]">Add an extra layer of security</p></div>
              <button onClick={() => setTwoFA(!twoFA)} className={`w-11 h-6 rounded-full transition-colors relative ${twoFA ? "bg-[#22A958]" : "bg-[#D9D3CB]"}`}>
                <motion.div className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ left: twoFA ? "22px" : "2px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Fingerprint size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Biometric Login</p><p className="text-[10px] text-[#9B9590]">Use fingerprint or face recognition</p></div>
              <button onClick={() => setBiometric(!biometric)} className={`w-11 h-6 rounded-full transition-colors relative ${biometric ? "bg-[#22A958]" : "bg-[#D9D3CB]"}`}>
                <motion.div className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ left: biometric ? "22px" : "2px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Notifications</h3>
          <div className="space-y-1">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Bell size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A] capitalize">{key} Alerts</p><p className="text-[10px] text-[#9B9590]">Receive {key} notifications</p></div>
                <button onClick={() => toggleNotification(key as keyof typeof notifications)} className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-[#22A958]" : "bg-[#D9D3CB]"}`}>
                  <motion.div className="w-5 h-5 rounded-full bg-white absolute top-0.5" animate={{ left: value ? "22px" : "2px" }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Support */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Support</h3>
          <div className="space-y-1">
            <Link href="/helpcenter/">
              <button className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><HelpCircle size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Help Center</p><p className="text-[10px] text-[#9B9590]">Browse FAQs and guides</p></div>
                <ChevronRight size={16} className="text-[#D9D3CB]" />
              </button>
            </Link>
            <button className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Mail size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Contact Support</p><p className="text-[10px] text-[#9B9590]">support@axi.com</p></div>
              <ChevronRight size={16} className="text-[#D9D3CB]" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <Link href="/login/">
          <motion.button whileTap={{ scale: 0.97 }} className="w-full py-4 rounded-xl bg-[#D31C2B] text-white font-bold text-sm flex items-center justify-center gap-2">
            <LogOut size={16} /> Sign Out
          </motion.button>
        </Link>
      </div>

      <LiveChatBot />
    </div>
  );
}
