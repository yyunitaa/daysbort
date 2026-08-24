"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";

export default function NewOrganizationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal membuat organisasi.");
        return;
      }
      router.push("/organization/figures");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm bg-white border border-[#e2e8f0] rounded-xl shadow-sm p-8">
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#2563eb14" }}>
          <Building2 size={18} color="#2563eb" strokeWidth={2} />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Buat Organisasi</h1>
        <p className="text-sm text-slate-500 text-center">
          Buat organisasi baru untuk mulai menambahkan figur yang ingin dipantau.
          Organisasi ini akan langsung jadi organisasi aktif Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="orgName" className="text-xs font-medium text-slate-500">Nama Organisasi</label>
          <input
            id="orgName"
            type="text"
            placeholder="mis. Partai Golkar"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>

        {error && <p className="text-sm text-[#dc2626]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 rounded-lg bg-[#2563eb] text-white text-sm font-medium py-2.5 disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Buat Organisasi"}
        </button>
      </form>
    </div>
  );
}
