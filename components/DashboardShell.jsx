"use client";

import React, { useState } from "react";
import { ChevronDown, BarChart3 } from "lucide-react";
import SelfPerceptionTab from "./tabs/SelfPerceptionTab";
import RegencyTab from "./tabs/RegencyTab";
import AudienceTab from "./tabs/AudienceTab";
import { BLUE, BORDER } from "./ui";

const TABS = [
  { id: "self", label: "Citra Pribadi Bupati", subtitle: "Bagaimana warga menilai Bapak Amri Jamaluddin di media sosial" },
  { id: "regency", label: "Kabupaten Kolaka", subtitle: "Bagaimana warga menilai Kabupaten Kolaka secara umum" },
  { id: "audience", label: "Pendukung & Pengikut", subtitle: "Siapa saja audiens dan pendukung di media sosial" },
];

export default function DashboardShell() {
  const [tab, setTab] = useState("self");
  const [platform, setPlatform] = useState("Semua Platform");
  const [range, setRange] = useState("8 Minggu Terakhir");

  const active = TABS.find((t) => t.id === tab);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${BLUE}14` }}>
            <BarChart3 size={20} color={BLUE} strokeWidth={2.25} />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">Laporan Media Sosial Kabupaten Kolaka</h1>
            <p className="text-sm text-slate-500 mt-0.5">{active.subtitle}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="appearance-none bg-white border border-[#e2e8f0] text-sm text-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 cursor-pointer"
            >
              <option>Semua Platform</option>
              <option>Instagram</option>
              <option>TikTok</option>
              <option>X</option>
              <option>YouTube</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="appearance-none bg-white border border-[#e2e8f0] text-sm text-slate-700 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 cursor-pointer"
            >
              <option>8 Minggu Terakhir</option>
              <option>4 Minggu Terakhir</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
          </div>
        </div>
      </header>

      {/* Tab nav */}
      <nav className="bg-white px-6 md:px-10 border-b border-[#e2e8f0] flex gap-1 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
        {tab === "self" && <SelfPerceptionTab />}
        {tab === "regency" && <RegencyTab />}
        {tab === "audience" && <AudienceTab />}

        <footer className="pt-8 mt-2 border-t border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs text-slate-400">
          <span>Sumber data: pemantauan media sosial (Instagram, TikTok, X, YouTube)</span>
          <span>Data per 23 Agustus 2026</span>
        </footer>
      </main>
    </div>
  );
}
