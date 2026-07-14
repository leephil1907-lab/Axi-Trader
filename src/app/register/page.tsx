"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Eye, EyeOff, ChevronDown, Check, Globe, Monitor, Award, Shield, ArrowRight, Smartphone } from "lucide-react";
import { COUNTRIES, LANGUAGES, CURRENCIES, ACCOUNT_TYPES, PLATFORMS } from "@/lib/countries";
import LiveChatBot from "@/components/LiveChatBot";

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", password: "", confirmPassword: "",
    country: "Germany", language: "en", currency: "EUR", accountType: "standard", platform: "mt5", phone: "",
    agreeTerms: false, agreeRisk: false, agreeMarketing: false,
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const selectedCurrency = CURRENCIES.find((c) => c.code === form.currency);
  const selectedAccount = ACCOUNT_TYPES.find((a) => a.id === form.accountType);
  const selectedPlatform = PLATFORMS.find((p) => p.id === form.platform);
  const selectedLanguage = LANGUAGES.find((l) => l.code === form.language);

  const handleNext = () => { if (step < totalSteps) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };
  const updateForm = (key: string, value: string | boolean) => { setForm((prev) => ({ ...prev, [key]: value })); setOpenDropdown(null); };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      window.location.href = "/dashboard/";
    }, 2000);
  };

  const Dropdown = ({ label, value, options, onSelect, renderOption }: any) => (
    <div className="relative">
      <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">{label}</label>
      <button onClick={() => setOpenDropdown(openDropdown === label ? null : label)} className="w-full px-4 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white flex items-center justify-between hover:border-[#F5C842]/30 transition-colors">
        <span>{value}</span>
        <ChevronDown size={16} className={`text-white/40 transition-transform ${openDropdown === label ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {openDropdown === label && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto bg-[#2D2D2D] border border-[#444] rounded-xl shadow-2xl">
            {options.map((opt: any, i: number) => (
              <button key={i} onClick={() => onSelect(opt)} className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-[#444] hover:text-white transition-colors flex items-center justify-between">
                {renderOption ? renderOption(opt) : opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex flex-col">
      <div className="px-4 py-3 flex items-center justify-between border-b border-[#333]">
        <svg viewBox="0 0 200 60" className="w-16 h-auto">
          <text x="5" y="45" fontFamily="Arial, sans-serif" fontSize="40" fontWeight="900" fill="#D31C2B" letterSpacing="-2">axi</text>
          <polygon points="100,8 113,8 107,22" fill="#D31C2B" />
        </svg>
        <div className="relative">
          <button onClick={() => setOpenDropdown(openDropdown === "lang" ? null : "lang")} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#333] text-white/60 text-xs hover:bg-[#444] transition-colors">
            <Globe size={14} /><span>{selectedLanguage?.label}</span>
            <ChevronDown size={12} className={`transition-transform ${openDropdown === "lang" ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {openDropdown === "lang" && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-1 w-48 bg-[#2D2D2D] border border-[#444] rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => updateForm("language", l.code)} className={`w-full px-3 py-2.5 text-left text-xs hover:bg-[#444] transition-colors ${form.language === l.code ? "text-[#F5C842] font-bold" : "text-white/60"}`}>{l.label}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <svg viewBox="0 0 200 60" className="w-28 h-auto mx-auto mb-4">
              <text x="10" y="50" fontFamily="Arial, sans-serif" fontSize="48" fontWeight="900" fill="#D31C2B" letterSpacing="-2">axi</text>
              <polygon points="118,10 135,10 127,28" fill="#D31C2B" />
            </svg>
            <h1 className="text-2xl font-black text-white mb-2">Create Your Account</h1>
            <p className="text-white/50 text-sm">Start trading in minutes</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/40 font-bold">Step {step} of {totalSteps}</span>
              <span className="text-xs text-[#F5C842] font-bold">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-[#333] rounded-full overflow-hidden">
              <motion.div className="h-full bg-[#F5C842] rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
            </div>
          </div>

          <div className="bg-[#222] border border-[#333] rounded-2xl p-6 space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-lg font-bold text-white mb-1">Personal Details</h2>
                  <p className="text-xs text-white/40 mb-4">Enter your name and contact information</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">First Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                        <input type="text" value={form.firstName} onChange={(e) => updateForm("firstName", e.target.value)} placeholder="John" className="w-full pl-11 pr-4 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Last Name</label>
                      <input type="text" value={form.lastName} onChange={(e) => updateForm("lastName", e.target.value)} placeholder="Doe" className="w-full px-4 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="john@example.com" className="w-full pl-11 pr-4 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Phone</label>
                    <div className="relative">
                      <Smartphone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="+1 234 567 8900" className="w-full pl-11 pr-4 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                    </div>
                  </div>
                  <Dropdown label="Country of Residence" value={form.country} options={COUNTRIES} onSelect={(c: string) => updateForm("country", c)} />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-lg font-bold text-white mb-1">Security</h2>
                  <p className="text-xs text-white/40 mb-4">Create a strong password for your account</p>
                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type={showPass ? "text" : "password"} value={form.password} onChange={(e) => updateForm("password", e.target.value)} placeholder="Min 8 characters" className="w-full pl-11 pr-12 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`flex-1 h-1 rounded-full ${form.password.length >= i * 2 ? "bg-[#22A958]" : "bg-[#444]"}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-white/30 mt-1">Use at least 8 characters with numbers and symbols</p>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Confirm Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={(e) => updateForm("confirmPassword", e.target.value)} placeholder="Repeat password" className="w-full pl-11 pr-12 py-3.5 bg-[#333] border border-[#444] rounded-xl text-sm text-white placeholder:text-white/30 outline-none focus:border-[#F5C842]/50 transition-colors" />
                      <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                    {form.confirmPassword && form.password !== form.confirmPassword && (
                      <p className="text-[10px] text-[#D31C2B] mt-1">Passwords do not match</p>
                    )}
                  </div>
                  <Dropdown label="Preferred Language" value={selectedLanguage?.label || "English"} options={LANGUAGES} onSelect={(l: any) => updateForm("language", l.code)} renderOption={(l: any) => <span>{l.label}</span>} />
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-lg font-bold text-white mb-1">Trading Preferences</h2>
                  <p className="text-xs text-white/40 mb-4">Choose your account type and currency</p>
                  <Dropdown label="Account Currency" value={`${selectedCurrency?.flag} ${selectedCurrency?.label} (${selectedCurrency?.code})`} options={CURRENCIES} onSelect={(c: any) => updateForm("currency", c.code)} renderOption={(c: any) => <span>{c.flag} {c.label} ({c.code})</span>} />
                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Account Type</label>
                    <div className="space-y-2">
                      {ACCOUNT_TYPES.map((a) => (
                        <button key={a.id} onClick={() => updateForm("accountType", a.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${form.accountType === a.id ? "bg-[#D31C2B]/10 border border-[#D31C2B]" : "bg-[#333] border border-[#444] hover:border-[#F5C842]/30"}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.accountType === a.id ? "border-[#D31C2B]" : "border-[#444]"}`}>
                            {form.accountType === a.id && <div className="w-2.5 h-2.5 rounded-full bg-[#D31C2B]" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{a.label}</p>
                            <p className="text-[10px] text-white/40">{a.description} · Min deposit: ${a.minDeposit}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-white/40">Spread</p>
                            <p className="text-xs font-bold text-[#F5C842]">{a.spread}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-white/50 font-bold uppercase tracking-wider mb-2 block">Trading Platform</label>
                    <div className="space-y-2">
                      {PLATFORMS.map((p) => (
                        <button key={p.id} onClick={() => updateForm("platform", p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${form.platform === p.id ? "bg-[#D31C2B]/10 border border-[#D31C2B]" : "bg-[#333] border border-[#444] hover:border-[#F5C842]/30"}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.platform === p.id ? "border-[#D31C2B]" : "border-[#444]"}`}>
                            {form.platform === p.id && <div className="w-2.5 h-2.5 rounded-full bg-[#D31C2B]" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{p.label}</p>
                            <p className="text-[10px] text-white/40">{p.description}</p>
                          </div>
                          <Monitor size={16} className="text-white/30" />
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h2 className="text-lg font-bold text-white mb-1">Review & Confirm</h2>
                  <p className="text-xs text-white/40 mb-4">Verify your information before creating your account</p>
                  <div className="p-4 bg-[#333] rounded-xl space-y-3">
                    <div className="flex justify-between text-sm"><span className="text-white/40">Name</span><span className="text-white font-bold">{form.firstName} {form.lastName}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">Email</span><span className="text-white font-bold">{form.email}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">Country</span><span className="text-white font-bold">{form.country}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">Currency</span><span className="text-white font-bold">{selectedCurrency?.code}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">Account</span><span className="text-white font-bold">{selectedAccount?.label}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-white/40">Platform</span><span className="text-white font-bold">{selectedPlatform?.label}</span></div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.agreeTerms} onChange={(e) => updateForm("agreeTerms", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-[#444] bg-[#333] accent-[#D31C2B]" />
                      <span className="text-xs text-white/50 leading-relaxed">I agree to the <Link href="/helpcenter/" className="text-[#F5C842] hover:underline">Terms of Service</Link> and <Link href="/helpcenter/" className="text-[#F5C842] hover:underline">Privacy Policy</Link></span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.agreeRisk} onChange={(e) => updateForm("agreeRisk", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-[#444] bg-[#333] accent-[#D31C2B]" />
                      <span className="text-xs text-white/50 leading-relaxed">I understand that trading involves risk and may result in loss of capital. <strong>55.1% of retail clients lose money.</strong></span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={form.agreeMarketing} onChange={(e) => updateForm("agreeMarketing", e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-[#444] bg-[#333] accent-[#D31C2B]" />
                      <span className="text-xs text-white/50 leading-relaxed">I agree to receive marketing communications (optional)</span>
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3 pt-2">
              {step > 1 && (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleBack} className="flex-1 py-3.5 rounded-xl border border-[#444] text-white font-bold text-sm hover:bg-[#333] transition-colors">Back</motion.button>
              )}
              {step < totalSteps ? (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleNext} className="flex-1 py-3.5 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm hover:bg-[#E0B73A] transition-colors flex items-center justify-center gap-2">
                  Continue <ArrowRight size={16} />
                </motion.button>
              ) : (
                <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit} disabled={isLoading || !form.agreeTerms || !form.agreeRisk} className="flex-1 py-3.5 rounded-xl bg-[#F5C842] text-[#1A1A1A] font-bold text-sm hover:bg-[#E0B73A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isLoading ? <div className="w-4 h-4 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" /> : <><Check size={16} /> Create Account</>}
                </motion.button>
              )}
            </div>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            Already have an account? <Link href="/login/" className="text-[#F5C842] font-bold hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>

      <div className="px-4 py-4 border-t border-[#333]">
        <div className="flex items-center justify-center gap-6 text-white/30 text-[10px]">
          <span className="flex items-center gap-1"><Shield size={10} /> SSL Secured</span>
          <span className="flex items-center gap-1"><Award size={10} /> Regulated</span>
          <span className="flex items-center gap-1"><Monitor size={10} /> 200+ Instruments</span>
        </div>
      </div>

      <LiveChatBot />
    </div>
  );
}
