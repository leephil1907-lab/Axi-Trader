"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, User, Bell, Globe, ChevronRight, LogOut,
  CreditCard, FileText, HelpCircle, ShieldCheck,
} from "lucide-react";
import { LANGUAGES } from "@/lib/countries";
import { clearClientAuth, getAuthToken, removeAuthToken } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

type Profile = {
  name?: string; firstName?: string; lastName?: string; email?: string;
  currency?: string; kycStatus?: string;
};

const KYC_LABELS: Record<string, { text: string; classes: string }> = {
  verified: { text: "Verified", classes: "bg-[#22A958]/20 text-[#22A958]" },
  pending: { text: "Pending review", classes: "bg-[#F5C842]/20 text-[#8a6d00]" },
  rejected: { text: "Action required", classes: "bg-[#D31C2B]/15 text-[#D31C2B]" },
  not_started: { text: "Not verified", classes: "bg-white/15 text-white/60" },
};

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({ trade: true, price: true, deposit: true, marketing: false });
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("axi-language");
      if (savedLang) setLanguage(savedLang);
      const savedNotif = localStorage.getItem("axi-notifications");
      if (savedNotif) setNotifications((prev) => ({ ...prev, ...JSON.parse(savedNotif) }));
    } catch { /* device preferences unavailable */ }
    const token = getAuthToken();
    if (!token) { router.replace("/login/?redirect=/settings/"); return; }
    fetch("/api/user/portfolio/", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProfile(data.user || null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [router]);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("axi-notifications", JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const changeLanguage = (code: string) => {
    setLanguage(code);
    try { localStorage.setItem("axi-language", code); } catch { /* ignore */ }
  };

  const signOut = () => {
    clearClientAuth();
    removeAuthToken();
    router.replace("/login/");
  };

  const selectedLang = LANGUAGES.find((l) => l.code === language);
  const initials = profile
    ? `${(profile.firstName || profile.name || "?").trim().charAt(0)}${(profile.lastName || "").trim().charAt(0)}`.toUpperCase() || "A"
    : "A";
  const kyc = KYC_LABELS[profile?.kycStatus || "not_started"] || KYC_LABELS.not_started;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED] transition-colors" aria-label="Go back">
            <ArrowLeft size={20} className="text-[#1A1A1A]" />
          </button>
          <h1 className="text-lg font-bold text-[#1A1A1A]">Settings</h1>
        </div>
      </header>

      <div className="flex-1 px-4 py-4 overflow-y-auto pb-24">
        {/* Profile Card — real authenticated account */}
        <div className="p-4 bg-[#1A1A1A] rounded-2xl mb-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#D31C2B] flex items-center justify-center text-white text-lg font-black">{initials}</div>
          <div className="min-w-0">
            <p className="text-base font-bold text-white truncate">{loading ? "Loading account…" : profile?.name || "Account"}</p>
            <p className="text-xs text-white/50 truncate">{loading ? " " : profile?.email || ""}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded uppercase ${kyc.classes}`}>{kyc.text}</span>
          </div>
          <button onClick={signOut} className="ml-auto p-2 rounded-xl bg-[#333] text-white/60 hover:text-white transition-colors" aria-label="Sign out">
            <LogOut size={16} />
          </button>
        </div>

        {profile && profile.kycStatus !== "verified" && (
          <Link href="/verify/" className="mb-6 flex items-center gap-3 p-4 bg-[#fff9ed] border border-[#f0dfb5] rounded-2xl">
            <ShieldCheck size={20} className="text-[#D31C2B] shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold text-[#1A1A1A]">Verify your identity</p>
              <p className="text-[11px] text-[#6B6560]">Required before live trading. Takes a few minutes.</p>
            </div>
            <ChevronRight size={16} className="text-[#9B9590]" />
          </Link>
        )}

        {/* Account Settings */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Account</h3>
          <div className="space-y-1">
            <div className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><User size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Personal Information</p><p className="text-[10px] text-[#9B9590]">{profile?.email || "Your profile details"} · {profile?.currency || ""}</p></div>
            </div>
            <Link href="/wallet/">
              <div className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><CreditCard size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Payment Methods</p><p className="text-[10px] text-[#9B9590]">Funding options enabled for your account</p></div>
                <ChevronRight size={16} className="text-[#D9D3CB]" />
              </div>
            </Link>
            <Link href="/verify/">
              <div className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><FileText size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Documents</p><p className="text-[10px] text-[#9B9590]">KYC and verification documents · {kyc.text}</p></div>
                <ChevronRight size={16} className="text-[#D9D3CB]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Preferences — stored on this device */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Preferences</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Globe size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Language</p><p className="text-[10px] text-[#9B9590]">{selectedLang?.label} · this device</p></div>
              <select value={language} onChange={(e) => changeLanguage(e.target.value)} className="bg-white px-2 py-1 rounded-lg text-xs font-bold text-[#1A1A1A] outline-none border border-[#D9D3CB]" aria-label="Language">
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Security — honest account session state */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Security</h3>
          <div className="p-4 bg-[#F5F2ED] rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><ShieldCheck size={16} className="text-white" /></div>
              <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Signed in</p><p className="text-[10px] text-[#9B9590]">This device holds an active session{profile?.email ? ` for ${profile.email}` : ""}.</p></div>
            </div>
            <p className="mt-3 text-[11px] leading-5 text-[#6B6560]">Sessions are token-secured and expire automatically. Use Sign Out on shared devices. Additional authentication factors are not available on this account.</p>
          </div>
        </div>

        {/* Notifications — device preferences */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-[#9B9590] uppercase tracking-wider mb-3">Notifications</h3>
          <div className="space-y-1">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><Bell size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A] capitalize">{key} Alerts</p><p className="text-[10px] text-[#9B9590]">Preference for this device</p></div>
                <button onClick={() => toggleNotification(key as keyof typeof notifications)} className={`w-11 h-6 rounded-full transition-colors relative ${value ? "bg-[#22A958]" : "bg-[#D9D3CB]"}`} aria-label={`Toggle ${key} alerts`}>
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
              <div className="w-full flex items-center gap-3 p-3 bg-[#F5F2ED] rounded-xl text-left hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-[#1A1A1A] flex items-center justify-center"><HelpCircle size={16} className="text-white" /></div>
                <div className="flex-1"><p className="text-sm font-bold text-[#1A1A1A]">Help Center</p><p className="text-[10px] text-[#9B9590]">Browse FAQs and guides</p></div>
                <ChevronRight size={16} className="text-[#D9D3CB]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Logout */}
        <motion.button whileTap={{ scale: 0.97 }} onClick={signOut} className="w-full py-4 rounded-xl bg-[#D31C2B] text-white font-bold text-sm flex items-center justify-center gap-2">
          <LogOut size={16} /> Sign Out
        </motion.button>
      </div>

      <LiveChatBot />
    </div>
  );
}
