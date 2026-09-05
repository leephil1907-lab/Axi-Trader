"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, Globe2, LockKeyhole, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { setAuthToken, setClientUser } from "@/lib/client-auth";

const TOTAL_STEPS = 5;

function AxiLogo() {
  return (
    <Link href="/" aria-label="Axi home" className="inline-flex items-center gap-2.5">
      <span className="axi-mark" aria-hidden="true"><i /><i /><i /></span>
      <span className="text-[28px] font-black tracking-[-0.08em] text-[#17191a]">axi</span>
    </Link>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    country: "United States",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    knowledge: "",
    terms: false,
    marketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const progress = useMemo(() => `${(step / TOTAL_STEPS) * 100}%`, [step]);

  function update(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
  }

  function next() {
    setError("");
    if (step === 1 && !form.country) return setError("Select your country of residence to continue.");
    if (step === 2) {
      if (!form.email.trim()) return setError("Enter your email address.");
      if (form.password.length < 8) return setError("Your password must contain at least 8 characters.");
      if (!/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) return setError("Use uppercase, lowercase, a number and a symbol in your password.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    }
    if (step === 3) {
      if (!form.firstName.trim() || !form.lastName.trim()) return setError("Enter your first and last name.");
      if (!form.phone.trim()) return setError("Enter your mobile number.");
    }
    if (step === 4 && !form.knowledge) return setError("Please answer the knowledge question before continuing.");
    setStep((current) => Math.min(TOTAL_STEPS, current + 1));
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    setError("");
    if (!form.terms) {
      setError("You must agree to the Terms and Conditions and Privacy Policy to continue.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          country: form.country,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "We couldn't create your account. Please check your details and try again.");
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

  const steps = ["Country", "Account", "Personal", "Profile", "Review"];

  return (
    <main className="min-h-screen bg-[#f0ede7] text-[#17191a]">
      <header className="border-b border-[#dedbd5] bg-white">
        <div className="container-axi flex h-[72px] items-center justify-between">
          <AxiLogo />
          <p className="text-xs font-semibold text-[#6c6f70]">Already registered? <Link href="/login/" className="font-bold text-[#e4002e] hover:underline">Sign in</Link></p>
        </div>
      </header>

      <div className="container-axi py-7 sm:py-10 lg:py-14">
        <div className="mx-auto max-w-[900px]">
          <div className="mb-7 rounded-[5px] border border-[#dedbd5] bg-white px-5 py-5 sm:px-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#e4002e]">Open an account</p>
                <h1 className="mt-1 text-2xl font-black tracking-[-0.035em] sm:text-3xl">Create your Axi account</h1>
              </div>
              <span className="hidden text-xs font-bold text-[#6c6f70] sm:block">Step {step} of {TOTAL_STEPS}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#e7e4df]" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
              <div className="h-full rounded-full bg-[#e4002e] transition-all duration-300" style={{ width: progress }} />
            </div>
            <div className="mt-4 grid grid-cols-5 gap-1">
              {steps.map((label, index) => {
                const number = index + 1;
                return <div key={label} className={`text-[9px] font-extrabold uppercase tracking-[0.08em] ${number <= step ? "text-[#17191a]" : "text-[#a1a3a3]"}`}>{label}</div>;
              })}
            </div>
          </div>

          <div className="grid gap-7 lg:grid-cols-[1fr_290px]">
            <section className="rounded-[5px] border border-[#dedbd5] bg-white p-6 sm:p-9">
              {error && <div role="alert" className="mb-6 rounded-[4px] border border-[#efc5c8] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#9f1722]">{error}</div>}

              {step === 1 && (
                <div>
                  <div className="mb-7">
                    <h2 className="text-2xl font-black tracking-[-0.03em]">Where do you live?</h2>
                    <p className="mt-2 text-sm leading-6 text-[#6c6f70]">Choose your country of residence. Your available account features and verification requirements may depend on this selection.</p>
                  </div>
                  <label htmlFor="country" className="mb-2 block text-xs font-bold">Country of residence</label>
                  <div className="relative">
                    <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" />
                    <select id="country" value={form.country} onChange={(event) => update("country", event.target.value)} className="h-12 w-full appearance-none rounded-[4px] border border-[#cfd0ce] bg-white pl-11 pr-4 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10">
                      {COUNTRIES.map((country) => <option key={country} value={country}>{country}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <div className="mb-7"><h2 className="text-2xl font-black tracking-[-0.03em]">Create your login</h2><p className="mt-2 text-sm leading-6 text-[#6c6f70]">Use your email address and create a strong password for secure access.</p></div>
                  <div className="space-y-5">
                    <div><label htmlFor="email" className="mb-2 block text-xs font-bold">Email address</label><div className="relative"><Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] pl-11 pr-4 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" placeholder="Email address" /></div></div>
                    <div><label htmlFor="password" className="mb-2 block text-xs font-bold">Password</label><div className="relative"><LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.password} onChange={(event) => update("password", event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] pl-11 pr-11 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" placeholder="Create a password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#777a7b]">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div><p className="mt-2 text-[11px] leading-5 text-[#777a7b]">At least 8 characters, including uppercase, lowercase, a number and a symbol.</p></div>
                    <div><label htmlFor="confirmPassword" className="mb-2 block text-xs font-bold">Confirm password</label><input id="confirmPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] px-4 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" placeholder="Confirm your password" /></div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <div className="mb-7"><h2 className="text-2xl font-black tracking-[-0.03em]">Tell us about yourself</h2><p className="mt-2 text-sm leading-6 text-[#6c6f70]">These details are used to create your account and will be required for identity verification.</p></div>
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2"><div><label htmlFor="firstName" className="mb-2 block text-xs font-bold">First name</label><div className="relative"><UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="firstName" autoComplete="given-name" value={form.firstName} onChange={(event) => update("firstName", event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] pl-11 pr-4 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" placeholder="First name" /></div></div><div><label htmlFor="lastName" className="mb-2 block text-xs font-bold">Last name</label><input id="lastName" autoComplete="family-name" value={form.lastName} onChange={(event) => update("lastName", event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] px-4 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" placeholder="Last name" /></div></div>
                    <div><label htmlFor="phone" className="mb-2 block text-xs font-bold">Mobile number</label><div className="relative"><Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b7e7f]" /><input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} className="h-12 w-full rounded-[4px] border border-[#cfd0ce] pl-11 pr-4 text-sm outline-none focus:border-[#e4002e] focus:ring-2 focus:ring-[#e4002e]/10" placeholder="Mobile number" /></div></div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div>
                  <div className="mb-7"><h2 className="text-2xl font-black tracking-[-0.03em]">Trading knowledge</h2><p className="mt-2 text-sm leading-6 text-[#6c6f70]">Before opening an account, we need to understand your experience with leveraged trading.</p></div>
                  <fieldset className="space-y-3"><legend className="mb-3 text-xs font-bold">Which best describes your trading experience?</legend>{["I am new to trading", "I have some trading experience", "I actively trade financial markets"].map((option) => <label key={option} className={`flex cursor-pointer items-start gap-3 rounded-[4px] border p-4 transition ${form.knowledge === option ? "border-[#e4002e] bg-[#fff7f7]" : "border-[#d9d8d5] hover:border-[#aeb0b0]"}`}><input type="radio" name="knowledge" value={option} checked={form.knowledge === option} onChange={(event) => update("knowledge", event.target.value)} className="mt-0.5 accent-[#e4002e]" /><span className="text-sm font-semibold">{option}</span></label>)}</fieldset>
                </div>
              )}

              {step === 5 && (
                <form onSubmit={submit}>
                  <div className="mb-7"><h2 className="text-2xl font-black tracking-[-0.03em]">Review and continue</h2><p className="mt-2 text-sm leading-6 text-[#6c6f70]">Review your information and accept the agreements to create your account.</p></div>
                  <div className="mb-6 grid gap-3 rounded-[4px] bg-[#f6f4f0] p-5 text-sm sm:grid-cols-2"><div><span className="block text-[10px] font-bold uppercase tracking-wider text-[#777a7b]">Name</span><strong>{form.firstName} {form.lastName}</strong></div><div><span className="block text-[10px] font-bold uppercase tracking-wider text-[#777a7b]">Country</span><strong>{form.country}</strong></div><div><span className="block text-[10px] font-bold uppercase tracking-wider text-[#777a7b]">Email</span><strong className="break-all">{form.email}</strong></div><div><span className="block text-[10px] font-bold uppercase tracking-wider text-[#777a7b]">Mobile</span><strong>{form.phone}</strong></div></div>
                  <div className="space-y-4"><label className="flex gap-3 text-sm leading-6"><input type="checkbox" checked={form.terms} onChange={(event) => update("terms", event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#e4002e]" /><span>I agree to the Terms and Conditions and acknowledge the Privacy Policy.</span></label><label className="flex gap-3 text-sm leading-6"><input type="checkbox" checked={form.marketing} onChange={(event) => update("marketing", event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#e4002e]" /><span>I would like to receive market analysis and promotional communications. <span className="text-[#777a7b]">Optional</span></span></label></div>
                  <button type="submit" disabled={loading} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-[#e4002e] px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-white transition hover:bg-[#b20024] disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account" : "Create account"}{!loading && <ArrowRight className="h-4 w-4" />}</button>
                </form>
              )}

              <div className="mt-9 flex items-center justify-between gap-4 border-t border-[#e8e5e1] pt-6">
                {step > 1 ? <button type="button" onClick={() => { setError(""); setStep((current) => current - 1); }} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-[#cfd0ce] px-4 text-xs font-extrabold uppercase tracking-[0.1em] hover:bg-[#f6f4f0]"><ArrowLeft className="h-4 w-4" /> Back</button> : <span />}
                {step < TOTAL_STEPS && <button type="button" onClick={next} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-[#e4002e] px-5 text-xs font-extrabold uppercase tracking-[0.1em] text-white hover:bg-[#b20024]">Continue <ArrowRight className="h-4 w-4" /></button>}
              </div>
            </section>

            <aside className="hidden rounded-[5px] border border-[#dedbd5] bg-[#151718] p-7 text-white lg:block">
              <ShieldCheck className="h-7 w-7 text-[#f5c842]" />
              <h3 className="mt-5 text-lg font-black">A secure application</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">Your account application is collected through encrypted connections. Additional security and identity verification can be completed after registration.</p>
              <div className="mt-7 space-y-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/70"><div className="flex gap-3"><Check className="h-4 w-4 shrink-0 text-[#f5c842]" />Clear step-by-step application</div><div className="flex gap-3"><Check className="h-4 w-4 shrink-0 text-[#f5c842]" />Account security checks</div><div className="flex gap-3"><Check className="h-4 w-4 shrink-0 text-[#f5c842]" />Identity verification follows registration</div></div>
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
