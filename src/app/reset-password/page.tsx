"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";

function AxiLogo() {
  return (
    <Link href="/" aria-label="Axi home" className="inline-flex items-center gap-2.5">
      <span className="axi-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="text-[28px] font-black tracking-[-0.08em] text-white">axi</span>
    </Link>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Unable to reset password.");
      setDone(true);
    } catch (err: any) {
      setError(err?.message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 py-12">
      <div className="lg:hidden"><Link href="/" aria-label="Axi home" className="inline-flex items-center gap-2"><span className="axi-mark" aria-hidden="true"><i /><i /><i /></span><span className="text-2xl font-black tracking-[-0.08em] text-[#e4002e]">axi</span></Link></div>
      <h2 className="mt-6 text-3xl font-extrabold tracking-[-.03em]">Choose a new password</h2>
      <p className="mt-3 text-sm leading-6 text-[#6c6f70]">Enter the 6-digit code from your email, then set a new password (8+ characters).</p>
      {error && <div role="alert" className="mb-6 mt-6 flex gap-3 rounded-[4px] border border-[#efc5c8] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#9f1722]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {done ? (
        <div className="mt-6 rounded-[4px] border border-[#cde7d4] bg-[#eef7f0] px-4 py-4 text-sm leading-6">
          <p className="flex items-center gap-2 font-bold text-[#16884a]"><CheckCircle2 size={17} /> Password updated</p>
          <p className="mt-1 text-[#3c5a45]">Your password has been changed. Sign in with your new password.</p>
          <Link href="/login/" className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#171717] px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-black">Sign in <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-bold">Email</label>
            <div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" /></div>
          </div>
          <div>
            <label htmlFor="code" className="mb-2 block text-xs font-bold">6-digit code</label>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white px-4 text-center text-lg font-extrabold tracking-[0.5em] outline-none transition focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-bold">New password</label>
            <div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="password" type={show ? "text" : "password"} autoComplete="new-password" required minLength={8} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-11 text-sm outline-none transition focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" /><button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777a7b]">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
          </div>
          <div>
            <label htmlFor="confirm" className="mb-2 block text-xs font-bold">Confirm new password</label>
            <div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="confirm" type={show ? "text" : "password"} autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Repeat new password" className="h-12 w-full rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" /></div>
          </div>
          <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#e4002e] px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#b20024] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Updating" : "Update password"}{!loading && <ArrowRight className="h-4 w-4" />}</button>
        </form>
      )}
      <p className="mt-6 text-center text-sm text-[#6c6f70]">No code yet? <Link href="/forgot-password/" className="font-bold text-[#e4002e]">Send one</Link></p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-[#f0ede7] text-[#17191a]">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
        <section className="relative hidden overflow-hidden bg-[#151718] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
          <div className="absolute -right-32 top-1/4 h-[420px] w-[420px] rounded-full bg-[#e4002e]/15 blur-3xl" />
          <AxiLogo />
          <div className="relative">
            <p className="text-[11px] font-extrabold uppercase tracking-[.22em] text-white/40">/// Account recovery</p>
            <h1 className="mt-4 max-w-md text-4xl font-extrabold leading-tight tracking-[-.03em] text-white xl:text-5xl">One code. One new password. Done.</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/50">Codes expire after 15 minutes and stop working the moment your password changes.</p>
          </div>
          <p className="relative text-[11px] text-white/30">© AxiTrades · www.axitrades.com</p>
        </section>
        <section className="flex min-h-screen flex-col bg-white">
          <Suspense><ResetForm /></Suspense>
        </section>
      </div>
    </main>
  );
}
