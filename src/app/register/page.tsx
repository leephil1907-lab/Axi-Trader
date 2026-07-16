"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Mail, Lock, User, Globe, Phone, ArrowRight,
  AlertTriangle, CheckCircle
} from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { setAuthToken, setClientUser } from "@/lib/client-auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    country: "US", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          country: form.country,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setAuthToken(data.token);
      setClientUser(data.user);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/"), 800);
    } catch (err: any) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-[#D9D3CB]"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
            <span className="text-[#D31C2B]">axi</span> Account
          </h1>
          <p className="text-[#6B6560] mt-2 text-sm">Create your trading account in minutes</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" /> {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" /> Account created! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">First Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9590]" />
                <input
                  required value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B]"
                  placeholder="John"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Last Name</label>
              <input
                required value={form.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B]"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9590]" />
              <input
                type="email" required value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B]"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9590]" />
                <input
                  type="tel" value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B]"
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Country</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9590]" />
                <select
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B] bg-white"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9B9590]" />
              <input
                type={showPassword ? "text" : "password"} required
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B]"
                placeholder="Min 6 characters"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9590]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#1A1A1A] mb-1.5">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"} required
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#D9D3CB] text-sm focus:outline-none focus:ring-2 focus:ring-[#D31C2B]/20 focus:border-[#D31C2B]"
              placeholder="Repeat password"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-[#D31C2B] hover:bg-[#B91623] text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6B6560]">
          Already have an account?{" "}
          <Link href="/login/" className="text-[#D31C2B] font-semibold hover:underline">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
