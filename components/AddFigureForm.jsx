"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export default function AddFigureForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/figures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Gagal menambah figur.");
        return;
      }
      setName("");
      setTitle("");
      setOpen(false);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center gap-1.5 border border-dashed border-[#cbd5e1] rounded-xl p-5 text-sm font-medium text-slate-500 hover:text-[#2563eb] hover:border-[#2563eb] transition-colors"
      >
        <Plus size={16} />
        Tambah Figur
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[#e2e8f0] rounded-xl p-5 flex flex-col gap-3 bg-white">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="figureName" className="text-xs font-medium text-slate-500">Nama Figur</label>
        <input
          id="figureName"
          type="text"
          placeholder="mis. Bahlil Lahadalia"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="figureTitle" className="text-xs font-medium text-slate-500">Jabatan (opsional)</label>
        <input
          id="figureTitle"
          type="text"
          placeholder="mis. Menteri Investasi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg border border-[#e2e8f0] px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>

      {error && <p className="text-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-[#2563eb] text-white text-sm font-medium py-2 disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border border-[#e2e8f0] text-slate-600 text-sm font-medium px-3 py-2 hover:bg-slate-50"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
