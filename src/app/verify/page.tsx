"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, FileText, ShieldCheck, UploadCloud, AlertTriangle } from "lucide-react";
import { getAuthToken } from "@/lib/client-auth";
import LiveChatBot from "@/components/LiveChatBot";

type KycDoc = { id: string; type: string; status: string; fileName: string; createdAt: string; rejectionReason?: string | null };

const DOC_TYPES = [
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID card" },
  { value: "driver_license", label: "Driver's license" },
  { value: "utility_bill", label: "Utility bill (proof of address)" },
  { value: "bank_statement", label: "Bank statement (proof of address)" },
  { value: "selfie", label: "Selfie holding your ID" },
];

const MAX_BYTES = 5 * 1024 * 1024;

export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState("not_started");
  const [docs, setDocs] = useState<KycDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState(DOC_TYPES[0].value);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const token = getAuthToken();
    if (!token) { router.replace("/login/?redirect=/verify/"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/user/kyc/", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unable to load verification status");
      setStatus(data.kycStatus || "not_started");
      setDocs(data.documents || []);
    } catch (e: any) {
      setError(e.message || "Unable to load verification status");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  const readAsDataUrl = (f: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.onload = () => resolve(String(reader.result || ""));
      reader.readAsDataURL(f);
    });

  const submit = async () => {
    setError("");
    const token = getAuthToken();
    if (!token) { router.replace("/login/?redirect=/verify/"); return; }
    if (!file) return setError("Choose a document file to upload.");
    if (file.size > MAX_BYTES) return setError("File is too large. Maximum size is 5 MB.");
    setUploading(true);
    try {
      const fileUrl = await readAsDataUrl(file);
      const res = await fetch("/api/user/kyc/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ type: docType, fileUrl, fileName: file.name.slice(0, 120) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setFile(null);
      setDone(true);
      await load();
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const statusBanner =
    status === "verified" ? (
      <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-900 flex gap-2"><ShieldCheck size={18} className="shrink-0 mt-0.5" />Your identity is verified. Live trading is unlocked once a broker execution gateway is connected.</div>
    ) : status === "pending" ? (
      <div className="p-4 rounded-2xl bg-[#fff9ed] border border-[#f0dfb5] text-sm text-[#6d5a1f] flex gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5" />Your documents are under review. We will update your status once compliance has decided.</div>
    ) : status === "rejected" ? (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-800 flex gap-2"><AlertTriangle size={18} className="shrink-0 mt-0.5" />Your last submission was not approved. Please upload a clearer, valid document below.</div>
    ) : (
      <div className="p-4 rounded-2xl bg-[#F5F2ED] text-sm text-[#6B6560]">Upload an identity document to start verification. Approval is done by compliance review — never automatic.</div>
    );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-[#D9D3CB] px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-[#F5F2ED]" aria-label="Go back"><ArrowLeft size={20} /></button>
          <h1 className="text-lg font-bold">Identity Verification</h1>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 max-w-xl w-full mx-auto pb-24">
        {loading ? (
          <p className="p-8 text-center text-sm text-[#6B6560]">Loading verification status…</p>
        ) : (
          <>
            {statusBanner}
            {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
            {done && <div className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 text-sm text-green-900 flex gap-2"><Check size={18} className="shrink-0 mt-0.5" />Document received. Your status is now pending review.</div>}

            {status !== "verified" && (
              <section className="mt-6 p-5 bg-[#F5F2ED] rounded-2xl">
                <h2 className="font-black">Submit a document</h2>
                <label className="block mt-4 text-xs font-bold uppercase text-[#6B6560]">Document type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)} className="w-full mt-2 px-4 py-3 rounded-xl border bg-white text-sm font-semibold">
                  {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <label className="block mt-4 text-xs font-bold uppercase text-[#6B6560]">File (JPG, PNG or PDF · max 5 MB)</label>
                <label className="mt-2 flex items-center gap-3 p-4 bg-white rounded-xl border border-dashed border-[#c9c4bb] cursor-pointer">
                  <UploadCloud size={20} className="text-[#D31C2B] shrink-0" />
                  <span className="text-sm font-semibold truncate">{file ? file.name : "Choose a file…"}</span>
                  <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
                <button onClick={submit} disabled={uploading || !file} className="mt-4 w-full py-3.5 rounded-xl bg-[#1A1A1A] text-white font-bold text-sm disabled:opacity-50">
                  {uploading ? "Uploading…" : "Submit for review"}
                </button>
                <p className="mt-3 text-[11px] leading-5 text-[#9B9590]">Documents are stored with your account record for compliance review only.</p>
              </section>
            )}

            <section className="mt-6">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9B9590] mb-3">Submitted documents</h2>
              {docs.length === 0 ? (
                <p className="p-5 rounded-2xl bg-[#F5F2ED] text-sm text-[#6B6560]">No documents submitted yet.</p>
              ) : (
                <div className="space-y-2">
                  {docs.map((d) => (
                    <div key={d.id} className="p-4 bg-[#F5F2ED] rounded-xl flex items-center gap-3">
                      <FileText size={18} className="text-[#6B6560] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{d.fileName}</p>
                        <p className="text-[10px] text-[#9B9590]">{DOC_TYPES.find((t) => t.value === d.type)?.label || d.type} · {new Date(d.createdAt).toLocaleString()}</p>
                        {d.status === "rejected" && d.rejectionReason && <p className="text-[11px] text-red-700 mt-1">{d.rejectionReason}</p>}
                      </div>
                      <span className="text-[9px] px-2 py-1 rounded font-bold uppercase bg-white">{d.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Link href="/dashboard/" className="inline-block mt-6 text-sm font-bold text-[#D31C2B]">Back to Dashboard →</Link>
          </>
        )}
      </main>
      <LiveChatBot />
    </div>
  );
}
