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
      <span className="text-[28px] font-black tracking-[-0.08em] text-[#17191a]">axi</span>
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
        setError(data.error || "We couldn't sign you in. Check your details and try again.");
        return;
      }

      setAuthToken(data.token);
      setClientUser(data.user);
      router.replace("/dashboard/");
    } catch {
      setError("Unable to connect right now. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f0ede7] text-[#17191a] lg:grid lg:grid-cols-[minmax(360px,0.92fr)_minmax(520px,1.08fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#151718] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full border border-white/10" />
        <div className="relative z-10"><AxiLogo /></div>
        <div className="relative z-10 max-w-md pb-8">
          <p className="mb-5 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#f5c842]">Trading platform</p>
          <h1 className="text-5xl font-black leading-[1.03] tracking-[-0.045em] text-white xl:text-6xl">Your markets.<br />Your decisions.</h1>
          <p className="mt-6 max-w-sm text-[15px] leading-7 text-white/65">Access your trading accounts, markets and portfolio from one secure place.</p>
          <div className="mt-10 flex items-center gap-3 text-xs font-semibold text-white/70"><ShieldCheck className="h-4 w-4 text-[#f5c842]" /> Secure account access</div>
        </div>
        <p className="relative z-10 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">Axi Trading Platform</p>
      </section>

      <section className="flex min-h-screen flex-col bg-white">
        <header className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="lg:hidden"><AxiLogo /></div>
          <Link href="/register/" className="ml-auto text-sm font-semibold text-[#17191a] hover:text-[#d61f2c]">Open an account</Link>
        </header>

        <div className="flex flex-1 items-start justify-center px-5 pb-12 pt-10 sm:px-8 sm:pt-16 lg:px-12 xl:pt-20">
          <div className="w-full max-w-[430px]">
            <div className="mb-9">
              <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#d61f2c]">Client portal</p>
              <h2 className="text-[34px] font-black tracking-[-0.04em] text-[#17191a] sm:text-[40px]">Welcome back</h2>
              <p className="mt-2 text-sm text-[#6c6f70]">Sign in to manage your trading account.</p>
            </div>

            {error && (
              <div role="alert" className="mb-5 flex gap-3 rounded-[5px] border border-[#efc5c8] bg-[#fff5f5] p-3.5 text-sm text-[#9f1722]">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-bold text-[#17191a]">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8b8f90]" />
                  <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#d61f2c] focus:ring-2 focus:ring-[#d61f2c]/10" placeholder="Email address" />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label htmlFor="password" className="text-xs font-bold text-[#17191a]">Password</label>
                  <span className="text-[11px] font-medium text-[#8b8f90]">Use your registered password</span>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#8b8f90]" />
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-12 text-sm outline-none transition focus:border-[#d61f2c] focus:ring-2 focus:ring-[#d61f2c]/10" placeholder="Password" />
                  <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-[#737778] hover:text-[#17191a]">
                    {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#d61f2c] px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#b91824] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Signing in" : "Sign in"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-8 border-t border-[#e5e3df] pt-7 text-center text-sm text-[#6c6f70]">
              <span>Don't have an account?</span>{" "}
              <Link href="/register/" className="font-bold text-[#d61f2c] hover:underline">Open an account</Link>
            </div>

            <p className="mt-10 text-center text-[10px] leading-5 text-[#8b8f90]">Trading involves risk. Please make sure you understand the risks before trading.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
