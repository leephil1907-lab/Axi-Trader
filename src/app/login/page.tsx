"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Globe, ChevronDown, Award, ArrowRight, Shield, Zap } from "lucide-react";
import { LANGUAGES } from "@/lib/countries";
import LiveChatBot from "@/components/LiveChatBot";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [language, setLanguage] = useState("en");
  const [showLang, setShowLang] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === language);

  const handleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard/";
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      {/* Top Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#333]">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 200 60" className="w-16 h-auto">
            <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="900" fill="#D31C2B" letterSpacing="-2">axi</text>
            <polygon points="100,8 113,8 107,22" fill="#D31C2B" />
          </svg>
        </div>
        <div className="relative">
          <button onClick={() => setShowLang(!showLang)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#333] text-white/60 text-xs hover:bg-[#444] transition-colors">
            <Globe size={14} /><span>{selectedLang?.label}</span>
            <ChevronDown size={12} className={`transition-transform ${showLang ? "rotate-180" : ""}`} />
          </button>
          {showLang && (
            <div className="absolute right-0 mt-1 w-48 bg-[#2D2D2D] border border-[#444] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => { setLanguage(l.code); setShowLang(false); }} className={`w-full px-3 py-2.5 text-left text-xs hover:bg-[#444] transition-colors flex items-center justify-between ${language === l.code ? "text-[#F5C842] font-bold" : "text-white/60"}`}>
                  {l.label}
                  {language === l.code && <Check size={12} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
          <div className="text-center mb-10">
            <svg viewBox="0 0 200 60" className="w-32 h-auto mx-auto mb-4">
              <text x="10" y="50" fontFamily="Arial, sans-serif" fontSize="56" fontWeight="900" fill="#D31C2B" letterSpacing="-2">axi</text>
              <polygon points="138,10 155,10 147,28" fill="#D31C2B" />
            </svg>
            <p className="text-white/50 text-sm">Sign in to your trading account</p>
          </div>

          <div className="bg-[#222] border border-[#333] rounded-2xl p-6 space-y-5">
            <div>
              <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full pl-11 pr-4 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full pl-11 pr-12 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="w-4 h-4 rounded border-[#444] bg-[#333] accent-[#D31C2B]" />
                <span className="text-xs text-white/50">Remember me</span>
              </label>
              <Link href="/helpcenter/" className="text-xs text-[#F5C842] font-bold hover:underline">Forgot password?</Link>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleLogin} disabled={isLoading || !email || !password} className="w-full py-3.5 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm hover:bg-[#E0B73A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isLoading ? <div className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" /> : <><ArrowRight size={16} /> Sign In</>}
            </motion.button>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#333]" />
              <span className="text-xs text-white/30">or continue with</span>
              <div className="flex-1 h-px bg-[#333]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <button className="py-2.5 bg-[#222] border border-[#333] rounded-xl flex items-center justify-center gap-2 hover:bg-[#333] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </button>
              <button className="py-2.5 bg-[#222] border border-[#333] rounded-xl flex items-center justify-center gap-2 hover:bg-[#333] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="white" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              </button>
              <button className="py-2.5 bg-[#222] border border-[#333] rounded-xl flex items-center justify-center gap-2 hover:bg-[#333] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="white" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </button>
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            Don't have an account? <Link href="/register/" className="text-[#F5C842] font-bold hover:underline">Open Account</Link>
          </p>
        </motion.div>
      </div>

      {/* Trust badges */}
      <div className="px-4 py-4 border-t border-[#333]">
        <div className="flex items-center justify-center gap-6 text-white/30 text-[10px]">
          <span className="flex items-center gap-1"><Shield size={10} /> SSL Secured</span>
          <span className="flex items-center gap-1"><Zap size={10} /> 2FA Available</span>
          <span className="flex items-center gap-1"><Award size={10} /> Regulated</span>
        </div>
      </div>

      <LiveChatBot />
    </div>
  );
}

function Check(props: any) {
  return <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>;
}
