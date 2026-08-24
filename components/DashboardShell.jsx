"use client";

import React, { useState } from "react";
import { ChevronDown, AlertTriangle, UserRound, Globe, Instagram, Music2, Twitter, Youtube, Calendar } from "lucide-react";
import SelfPerceptionTab from "./tabs/SelfPerceptionTab";
import RegencyTab from "./tabs/RegencyTab";
import AudienceTab from "./tabs/AudienceTab";
import Sidebar from "./Sidebar";
import { BLUE } from "./ui";

const PLATFORM_FILTERS = [
  { value: "Semua Platform", label: "Semua Platform", icon: Globe },
  { value: "Instagram", label: "Instagram", icon: Instagram },
  { value: "TikTok", label: "TikTok", icon: Music2 },
  { value: "X", label: "X", icon: Twitter },
  { value: "YouTube", label: "YouTube", icon: Youtube },
];

export default function DashboardShell({ figureId, figureName, figureTitle, subjectId, isRealData = true, showRegencyTab = false, selfData, audienceData, regencyData, organizationId, organizationName, organizations, username, email, accessibleFigures = [] }) {
  const [tab, setTab] = useState("self");
  const [platform, setPlatform] = useState("Semua Platform");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [figureMenuOpen, setFigureMenuOpen] = useState(false);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);

  function fmtShort(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  }
  const dateLabel = startDate || endDate
    ? `${fmtShort(startDate) || "…"} - ${fmtShort(endDate) || "…"}`
    : "Semua Tanggal";

  const namaFigur = figureName || "figur ini";
  const SUBTITLES = {
    self: `Bagaimana warga menilai ${namaFigur} di media sosial`,
    regency: "Bagaimana warga menilai Kabupaten Kolaka secara umum",
    audience: "Siapa saja audiens dan pendukung di media sosial",
  };
  const headerTitle = figureName
    ? `Laporan Media Sosial — ${figureName}${figureTitle ? ` · ${figureTitle}` : ""}`
    : "Laporan Media Sosial Kabupaten Kolaka";
  const otherFigures = accessibleFigures.filter((f) => f.id !== figureId);
  const canSwitchFigure = otherFigures.length > 0;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-start" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Sidebar organizationId={organizationId} organizationName={organizationName} organizations={organizations} activePage="dashboard" dashboardTab={tab} onDashboardTabChange={setTab} showRegencyTab={showRegencyTab} currentFigureId={figureId} username={username} email={email} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-[#e2e8f0] px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative">
            {canSwitchFigure ? (
              <button
                onClick={() => setFigureMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 text-left"
              >
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">{headerTitle}</h1>
                <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${figureMenuOpen ? "rotate-180" : ""}`} />
              </button>
            ) : (
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">{headerTitle}</h1>
            )}
            <p className="text-sm text-slate-500 mt-0.5">{SUBTITLES[tab]}</p>

            {figureMenuOpen && canSwitchFigure && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFigureMenuOpen(false)} />
                <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 p-2">
                  <p className="text-xs font-medium text-slate-400 px-2.5 py-1.5">Ganti ke figur lain</p>
                  <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                    {otherFigures.map((f) => (
                      <a
                        key={f.id}
                        href={`/dashboard/${f.id}`}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2563eb14" }}>
                          <UserRound size={14} color="#2563eb" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{f.name}</p>
                          {f.title && <p className="text-xs text-slate-400 truncate">{f.title}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-white border border-[#e2e8f0] rounded-lg p-1">
              {PLATFORM_FILTERS.map(({ value, label, icon: Icon }) => {
                const active = platform === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPlatform(value)}
                    title={label}
                    className="w-8 h-8 rounded-md flex items-center justify-center transition-colors"
                    style={active ? { background: `${BLUE}14`, color: BLUE } : undefined}
                  >
                    <Icon size={16} className={active ? "" : "text-slate-400"} color={active ? BLUE : undefined} />
                  </button>
                );
              })}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setDateMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 bg-white border border-[#e2e8f0] text-sm text-slate-700 rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                <Calendar size={14} className="text-slate-400" />
                {dateLabel}
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${dateMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {dateMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDateMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-white border border-[#e2e8f0] rounded-xl shadow-lg z-20 p-3 flex flex-col gap-2 w-64">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">Dari tanggal</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-white border border-[#e2e8f0] text-sm text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-500">Sampai tanggal</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-white border border-[#e2e8f0] text-sm text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                      />
                    </div>
                    {(startDate || endDate) && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="text-xs font-medium text-[#2563eb] hover:underline self-start mt-1"
                      >
                        Reset tanggal
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
          {!isRealData && (
            <div
              className="flex items-start gap-3 rounded-xl p-4 mb-6"
              style={{ background: "#dc262608", border: "1px solid #dc262633" }}
            >
              <AlertTriangle size={16} color="#dc2626" className="mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">
                Pemantauan data untuk <strong>{figureName}</strong> belum tersedia — menu dan
                chart di bawah ini masih kosong sampai figur ini terhubung ke data nyata.
              </p>
            </div>
          )}
          {tab === "self" && <SelfPerceptionTab figureName={figureName} data={selfData} platform={platform} startDate={startDate} endDate={endDate} />}
          {tab === "regency" && showRegencyTab && <RegencyTab data={regencyData} platform={platform} startDate={startDate} endDate={endDate} />}
          {tab === "audience" && <AudienceTab figureName={figureName} subjectId={subjectId} data={audienceData} platform={platform} />}

          <footer className="pt-8 mt-2 border-t border-[#e2e8f0] flex flex-col md:flex-row md:items-center justify-between gap-1 text-xs text-slate-400">
            <span>Sumber data: pemantauan media sosial (Instagram, TikTok, X, YouTube)</span>
            <span>Data per 23 Agustus 2026</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
