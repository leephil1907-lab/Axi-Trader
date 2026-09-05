"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { setAuthToken, setClientUser } from "@/lib/client-auth";

function AxiLogo() {
  return (
    <Link href="/" aria-label="Axi home" className="inline-flex items-center gap-2.5">
      <span className="axi-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="text-[28px] font-black tracking-[-0.08em] text-white">axi</span>
    </Link>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to sign in. Check your details and try again.");
        return;
      }
      setAuthToken(data.token);
      setClientUser(data.user);
      // Honor the ?redirect= target set by middleware for protected pages.
      // Only same-origin relative paths are accepted.
      const requested = new URLSearchParams(window.location.search).get("redirect");
      const target = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard/";
      router.replace(target);
    } catch {
      setError("Unable to connect right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0ede7] text-[#17191a]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#151718] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-[#e4002e]/15 blur-3xl" />
          <div className="relative"><AxiLogo /></div>
          <div className="relative max-w-xl text-white">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#f5c842]">Axi Client Portal</p>
            <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.055em] xl:text-6xl">Your markets.<br />Your account.<br /><span className="text-[#e4002e]">One workspace.</span></h1>
            <p className="mt-7 max-w-md text-sm leading-7 text-white/55">Access your trading account, monitor markets, manage positions and handle funding from one secure workspace.</p>
            <div className="mt-9 flex items-center gap-3 text-xs font-semibold text-white/55"><ShieldCheck className="h-5 w-5 text-[#e4002e]" /> Secure account access</div>
          </div>
          <p className="relative text-[10px] text-white/30">Trading involves risk. Make sure you understand the risks before trading.</p>
        </section>

        <section className="flex min-h-screen flex-col bg-white">
          <header className="flex h-[72px] items-center justify-between border-b border-[#dedbd5] px-5 sm:px-8 lg:px-12">
            <Link href="/" className="lg:hidden"><span className="text-[28px] font-black tracking-[-0.08em] text-[#17191a]">axi</span></Link>
            <span className="hidden lg:block" />
            <p className="text-xs font-semibold text-[#6c6f70]">New to Axi? <Link href="/register/" className="font-bold text-[#e4002e] hover:underline">Open an account</Link></p>
          </header>

          <div className="flex flex-1 items-center justify-center px-5 py-12 sm:px-8 lg:px-12">
            <div className="w-full max-w-[440px]">
              <div className="mb-9">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e4002e]">Client login</p>
                <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">Welcome back</h2>
                <p className="mt-3 text-sm leading-6 text-[#6c6f70]">Sign in to continue to your trading account.</p>
              </div>

              {error && <div role="alert" className="mb-6 flex gap-3 rounded-[4px] border border-[#efc5c8] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#9f1722]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

              <form onSubmit={submit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block text-xs font-bold">Email address</label>
                  <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" /></div>
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block text-xs font-bold">Password</label>
                  <div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-11 text-sm outline-none transition focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777a7b]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                </div>

                <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#e4002e] px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#b20024] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in" : "Sign in"}{!loading && <ArrowRight className="h-4 w-4" />}</button>
              </form>

              <div className="mt-8 border-t border-[#e5e3df] pt-7 text-center text-sm text-[#6c6f70]"><span>Don&apos;t have an account?</span>{" "}<Link href="/register/" className="font-bold text-[#e4002e] hover:underline">Open an account</Link></div>
              <p className="mt-10 text-center text-[10px] leading-5 text-[#8b8f90]">Trading involves risk. Please make sure you understand the risks before trading.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
