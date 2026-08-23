"use client";

import React from "react";
import { Info } from "lucide-react";

// Tema: clean, terang, profesional — dirancang supaya nyaman dibaca orang
// awam (non-teknis) saat presentasi ke Bupati/klien. Warna dipilih dari skala
// Tailwind standar (sudah teruji kontras & aksesibilitasnya), bukan warna
// custom sembarangan.

export const INK = "#0f172a";       // teks utama (judul, angka)
export const INK_SOFT = "#475569";  // teks sekunder
export const MUTED = "#94a3b8";     // teks pendukung/keterangan kecil
export const BORDER = "#e2e8f0";    // garis pembatas & border kartu
export const SURFACE = "#ffffff";   // latar kartu
export const PAGE_BG = "#f8fafc";   // latar halaman

export const BLUE = "#2563eb";      // warna utama/brand (aksen, highlight)
export const GREEN = "#16a34a";     // positif / baik
export const RED = "#dc2626";       // negatif / perlu perhatian
export const GRAY = "#64748b";      // netral

// Alias lama dipertahankan supaya kompatibel dengan kode yang sudah ada,
// dipetakan ke palet baru.
export const AMBER = BLUE;
export const TEAL = GREEN;
export const ROSE = RED;
export const SLATE = GRAY;

export const cardCls = "bg-white border border-[#e2e8f0] rounded-xl shadow-sm";

export function KPI({ icon: Icon, label, value, sub, accent = BLUE }) {
  return (
    <div className={`${cardCls} p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 inline-flex items-center gap-1.5">
          {label}
          <InfoTooltip text={sub} />
        </span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${accent}14` }}>
          <Icon size={16} color={accent} strokeWidth={2} />
        </div>
      </div>
      <span className="font-semibold text-2xl md:text-3xl text-slate-900 tabular-nums leading-none">{value}</span>
    </div>
  );
}

export function SectionLabel({ eyebrow, title, caveat }) {
  return (
    <div className="flex flex-col gap-1.5 mb-4">
      <div className="flex items-center gap-2.5">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
          style={{ background: `${BLUE}14`, color: BLUE }}
        >
          {eyebrow}
        </span>
        <h2 className="text-slate-900 text-base md:text-lg font-semibold">{title}</h2>
      </div>
      {caveat && <p className="text-xs text-slate-500 pl-8">{caveat}</p>}
    </div>
  );
}

export function Callout({ icon: Icon, color = BLUE, children }) {
  return (
    <div className="p-4 rounded-xl flex items-start gap-3" style={{ background: `${color}0d`, border: `1px solid ${color}33` }}>
      <Icon size={16} color={color} className="mt-0.5 shrink-0" />
      <p className="text-sm text-slate-700 leading-relaxed">{children}</p>
    </div>
  );
}

export function sentimentColor(net) {
  if (net > 20) return GREEN;
  if (net < 0) return RED;
  return GRAY;
}

// Label teks dengan tooltip penjelasan yang muncul saat di-hover. `description`
// null/undefined berarti tidak ada penjelasan tersedia — dirender sebagai teks
// biasa tanpa indikator hover.
export function HoverLabel({ text, description, className = "" }) {
  const [open, setOpen] = React.useState(false);

  if (!description) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="border-b border-dotted border-slate-400 cursor-help">{text}</span>
      {open && (
        <span
          role="tooltip"
          className="absolute z-20 left-0 top-full mt-1.5 w-64 rounded-lg p-3 text-xs font-normal leading-relaxed text-slate-700 shadow-lg bg-white"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {description}
        </span>
      )}
    </span>
  );
}

// Judul chart + ikon info kecil di sampingnya — penjelasan/catatan muncul
// sebagai tooltip saat di-hover, supaya tampilan chart tetap ringkas.
export function ChartTitle({ children, info }) {
  return (
    <div className="flex items-center gap-1.5 mb-4">
      <p className="text-sm font-medium text-slate-700">{children}</p>
      {info && <InfoTooltip text={info} />}
    </div>
  );
}

export function InfoTooltip({ text }) {
  const [open, setOpen] = React.useState(false);
  if (!text) return null;

  return (
    <span
      className="relative inline-flex shrink-0"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Info size={14} className="text-slate-400 cursor-help" />
      {open && (
        <span
          role="tooltip"
          className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-64 rounded-lg p-3 text-xs font-normal leading-relaxed text-slate-700 shadow-lg bg-white"
          style={{ border: `1px solid ${BORDER}` }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

export const chartAxisStyle = { fill: "#94a3b8", fontSize: 11 };
export const chartGridStroke = "#eef1f5";
export const chartTooltipStyle = { background: "#ffffff", border: `1px solid ${BORDER}`, borderRadius: 10, fontSize: 12, boxShadow: "0 4px 16px rgba(15,23,42,0.08)" };
