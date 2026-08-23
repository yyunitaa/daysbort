import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area, Legend
} from "recharts";
import { Users, TrendingUp, MessageCircle, MapPin, Activity, ChevronDown, Heart } from "lucide-react";

// ---------- Mock data (replace with Apify-sourced data) ----------
const ageData = [
  { range: "13-17", value: 4 },
  { range: "18-24", value: 27 },
  { range: "25-34", value: 34 },
  { range: "35-44", value: 20 },
  { range: "45-54", value: 10 },
  { range: "55+", value: 5 },
];

const genderData = [
  { name: "Laki-laki", value: 58 },
  { name: "Perempuan", value: 42 },
];

const cityData = [
  { city: "Pati", value: 4200 },
  { city: "Semarang", value: 3100 },
  { city: "Kudus", value: 2450 },
  { city: "Jepara", value: 1980 },
  { city: "Rembang", value: 1520 },
  { city: "Surabaya", value: 1210 },
  { city: "Jakarta", value: 980 },
  { city: "Blora", value: 860 },
];

const growthData = [
  { week: "W1", followers: 18200, engagement: 3.1 },
  { week: "W2", followers: 18650, engagement: 3.4 },
  { week: "W3", followers: 19100, engagement: 2.9 },
  { week: "W4", followers: 19980, engagement: 4.2 },
  { week: "W5", followers: 20700, engagement: 3.8 },
  { week: "W6", followers: 21850, engagement: 5.1 },
  { week: "W7", followers: 22400, engagement: 4.6 },
  { week: "W8", followers: 23600, engagement: 5.7 },
];

const sentimentTrend = [
  { week: "W1", positif: 62, netral: 28, negatif: 10 },
  { week: "W2", positif: 58, netral: 30, negatif: 12 },
  { week: "W3", positif: 65, netral: 24, negatif: 11 },
  { week: "W4", positif: 71, netral: 20, negatif: 9 },
  { week: "W5", positif: 68, netral: 22, negatif: 10 },
  { week: "W6", positif: 74, netral: 18, negatif: 8 },
  { week: "W7", positif: 70, netral: 21, negatif: 9 },
  { week: "W8", positif: 76, netral: 17, negatif: 7 },
];

const topSupporters = [
  { handle: "@warga_pati_peduli", followers: "84.2K", interaksi: 412, platform: "Instagram" },
  { handle: "@suarajateng", followers: "156K", interaksi: 388, platform: "X" },
  { handle: "@budi.hartono_", followers: "12.4K", interaksi: 301, platform: "Instagram" },
  { handle: "@patikita.id", followers: "63.8K", interaksi: 276, platform: "TikTok" },
  { handle: "@ratna_kusuma", followers: "9.1K", interaksi: 244, platform: "X" },
];

const contentPerf = [
  { title: "Peresmian Pasar", eng: 8420 },
  { title: "Kunjungan Posyandu", eng: 6110 },
  { title: "Konferensi Pers Banjir", eng: 5320 },
  { title: "Panen Raya Petani", eng: 4890 },
  { title: "Rapat Koordinasi Desa", eng: 2140 },
];

const topComments = [
  { handle: "@warga_pati_peduli", text: "Alhamdulillah pasar barunya bagus banget, terima kasih pak sudah dengar aspirasi pedagang", platform: "Instagram", likes: 1240, sentiment: "positif" },
  { handle: "@budi.hartono_", text: "Semoga program posyandu ini rutin ya, anak saya jadi lebih terpantau tumbuh kembangnya", platform: "Instagram", likes: 980, sentiment: "positif" },
  { handle: "@suarajateng", text: "Respon cepat pas banjir kemarin, tim di lapangan juga sigap", platform: "X", likes: 872, sentiment: "positif" },
  { handle: "@ratna_kusuma", text: "Kenapa jalan di desa saya belum diperbaiki juga padahal udah lapor dari tahun lalu?", platform: "X", likes: 654, sentiment: "negatif" },
  { handle: "@patikita.id", text: "Panen raya tahun ini hasilnya bagus, semoga harga gabah tetap stabil pak", platform: "TikTok", likes: 601, sentiment: "netral" },
  { handle: "@ahmad_setiawan", text: "Kunjungan ke posyandu keren, tapi tolong juga perhatikan puskesmas yang kurang tenaga medis", platform: "Instagram", likes: 588, sentiment: "netral" },
  { handle: "@dewi_lestari90", text: "Program bantuan UMKM tolong dipercepat pencairannya pak, banyak yang nunggu", platform: "Facebook", likes: 512, sentiment: "negatif" },
  { handle: "@rizky_pratama", text: "Mantap pembangunan infrastrukturnya, kelihatan hasilnya dalam setahun ini", platform: "X", likes: 470, sentiment: "positif" },
  { handle: "@siti_nurhaliza22", text: "Kapan giliran desa kami dapat program serupa? Sudah lama menunggu", platform: "Instagram", likes: 398, sentiment: "netral" },
  { handle: "@herman_wijaya", text: "Terima kasih atas perhatiannya ke petani, semoga terus berlanjut ke depannya", platform: "TikTok", likes: 355, sentiment: "positif" },
];

const AMBER = "#d4a94a";
const TEAL = "#4a9a8f";
const ROSE = "#c05f4f";
const SLATE = "#8c94a6";
const INK = "#e8e6df";

const cardCls = "bg-[#171b26] border border-[#2a3040] rounded-lg";

function KPI({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className={`${cardCls} p-5 flex flex-col gap-3 relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-[0.14em] text-[#8c94a6] font-medium">{label}</span>
        <Icon size={16} color={accent} strokeWidth={1.75} />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-3xl text-[#e8e6df] tabular-nums">{value}</span>
      </div>
      <span className="text-xs text-[#6f7688]">{sub}</span>
      <span
        className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-[0.08]"
        style={{ background: accent }}
      />
    </div>
  );
}

function SectionLabel({ eyebrow, title }) {
  return (
    <div className="flex items-baseline gap-3 mb-4">
      <span className="font-mono text-[11px] tracking-[0.14em] text-[#d4a94a] uppercase">{eyebrow}</span>
      <h2 className="text-[#e8e6df] text-lg font-semibold">{title}</h2>
      <div className="flex-1 h-px bg-[#2a3040]" />
    </div>
  );
}

export default function Dashboard() {
  const [platform, setPlatform] = useState("Semua Platform");
  const [range, setRange] = useState("8 Minggu");

  const totalAudience = 23600;
  const avgSentimentPos = 76;

  return (
    <div className="min-h-screen w-full bg-[#10131c] text-[#e8e6df]" style={{ fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }
        * { box-sizing: border-box; }
      `}</style>

      {/* Header */}
      <header className="border-b border-[#2a3040] px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#4a9a8f] animate-pulse" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4a9a8f]">Live Monitoring</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Audience Intelligence — Bupati Pati</h1>
          <p className="text-sm text-[#8c94a6] mt-0.5">Analisis demografi, dukungan &amp; sentimen audiens sosial media</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="appearance-none bg-[#171b26] border border-[#2a3040] text-sm text-[#e8e6df] rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#d4a94a] cursor-pointer"
            >
              <option>Semua Platform</option>
              <option>Instagram</option>
              <option>X (Twitter)</option>
              <option>TikTok</option>
              <option>Facebook</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8c94a6]" />
          </div>
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="appearance-none bg-[#171b26] border border-[#2a3040] text-sm text-[#e8e6df] rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-1 focus:ring-[#d4a94a] cursor-pointer"
            >
              <option>8 Minggu</option>
              <option>4 Minggu</option>
              <option>12 Minggu</option>
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8c94a6]" />
          </div>
        </div>
      </header>

      <main className="px-6 md:px-10 py-8 flex flex-col gap-10">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPI icon={Users} label="Total Audiens" value={totalAudience.toLocaleString("id-ID")} sub="+6.2% dari minggu lalu" accent={AMBER} />
          <KPI icon={Activity} label="Engagement Rate" value="5.7%" sub="Rata-rata 8 minggu terakhir" accent={TEAL} />
          <KPI icon={MessageCircle} label="Sentimen Positif" value={`${avgSentimentPos}%`} sub="Dari total komentar" accent={TEAL} />
          <KPI icon={TrendingUp} label="Pendukung Kunci" value="128" sub="Akun dengan interaksi tinggi" accent={AMBER} />
        </div>

        {/* Demographics */}
        <section>
          <SectionLabel eyebrow="01" title="Demografi Audiens" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className={`${cardCls} p-5 lg:col-span-1`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6]">Distribusi Usia</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ageData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" vertical={false} />
                  <XAxis dataKey="range" tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={{ stroke: "#2a3040" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#171b26", border: "1px solid #2a3040", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {ageData.map((_, i) => <Cell key={i} fill={AMBER} fillOpacity={0.35 + (ageData[i].value / 40) * 0.65} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className={`${cardCls} p-5 lg:col-span-1`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6]">Gender</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    <Cell fill={AMBER} />
                    <Cell fill={TEAL} />
                  </Pie>
                  <Tooltip contentStyle={{ background: "#171b26", border: "1px solid #2a3040", borderRadius: 6, fontSize: 12 }} />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(val) => <span style={{ color: "#c7cbd6", fontSize: 12 }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className={`${cardCls} p-5 lg:col-span-1`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6] flex items-center gap-1.5"><MapPin size={13} color={AMBER}/> Top Kota Asal</p>
              <div className="flex flex-col gap-2.5">
                {cityData.map((c, i) => {
                  const max = cityData[0].value;
                  return (
                    <div key={c.city} className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#6f7688] w-4">{i + 1}</span>
                      <span className="text-xs text-[#c7cbd6] w-20 truncate">{c.city}</span>
                      <div className="flex-1 h-2 bg-[#0f1219] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(c.value / max) * 100}%`, background: AMBER }} />
                      </div>
                      <span className="font-mono text-[11px] text-[#8c94a6] w-12 text-right">{c.value.toLocaleString("id-ID")}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Sentiment & growth */}
        <section>
          <SectionLabel eyebrow="02" title="Sentimen & Pertumbuhan" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${cardCls} p-5`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6]">Tren Sentimen Komentar</p>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={sentimentTrend} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={{ stroke: "#2a3040" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ background: "#171b26", border: "1px solid #2a3040", borderRadius: 6, fontSize: 12 }} />
                  <Area type="monotone" dataKey="positif" stackId="1" stroke={TEAL} fill={TEAL} fillOpacity={0.55} />
                  <Area type="monotone" dataKey="netral" stackId="1" stroke={SLATE} fill={SLATE} fillOpacity={0.35} />
                  <Area type="monotone" dataKey="negatif" stackId="1" stroke={ROSE} fill={ROSE} fillOpacity={0.55} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className={`${cardCls} p-5`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6]">Pertumbuhan Followers &amp; Engagement</p>
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={growthData} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" vertical={false} />
                  <XAxis dataKey="week" tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={{ stroke: "#2a3040" }} tickLine={false} />
                  <YAxis tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#171b26", border: "1px solid #2a3040", borderRadius: 6, fontSize: 12 }} />
                  <Line type="monotone" dataKey="followers" stroke={AMBER} strokeWidth={2} dot={{ r: 3, fill: AMBER }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Supporters & content */}
        <section>
          <SectionLabel eyebrow="03" title="Pendukung Kunci & Konten" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className={`${cardCls} p-5`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6]">Top Akun Pendukung</p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-[#6f7688] border-b border-[#2a3040]">
                    <th className="text-left font-medium pb-2">Akun</th>
                    <th className="text-left font-medium pb-2">Platform</th>
                    <th className="text-right font-medium pb-2">Followers</th>
                    <th className="text-right font-medium pb-2">Interaksi</th>
                  </tr>
                </thead>
                <tbody>
                  {topSupporters.map((s) => (
                    <tr key={s.handle} className="border-b border-[#1e2230] last:border-0">
                      <td className="py-2.5 text-[#e8e6df]">{s.handle}</td>
                      <td className="py-2.5 text-[#8c94a6]">{s.platform}</td>
                      <td className="py-2.5 text-right font-mono text-[#c7cbd6]">{s.followers}</td>
                      <td className="py-2.5 text-right font-mono text-[#d4a94a]">{s.interaksi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={`${cardCls} p-5`}>
              <p className="text-sm font-medium mb-4 text-[#c7cbd6]">Konten dengan Engagement Tertinggi</p>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={contentPerf} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a3040" horizontal={false} />
                  <XAxis type="number" tick={{ fill: "#8c94a6", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="title" tick={{ fill: "#c7cbd6", fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: "#171b26", border: "1px solid #2a3040", borderRadius: 6, fontSize: 12 }} />
                  <Bar dataKey="eng" radius={[0, 4, 4, 0]} fill={TEAL} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Top comments */}
        <section>
          <SectionLabel eyebrow="04" title="Top 10 Komentar" />
          <div className={`${cardCls} p-2`}>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-[#6f7688] border-b border-[#2a3040]">
                  <th className="text-left font-medium py-2.5 pl-4">#</th>
                  <th className="text-left font-medium py-2.5">Akun</th>
                  <th className="text-left font-medium py-2.5">Komentar</th>
                  <th className="text-left font-medium py-2.5">Platform</th>
                  <th className="text-left font-medium py-2.5">Sentimen</th>
                  <th className="text-right font-medium py-2.5 pr-4">Suka</th>
                </tr>
              </thead>
              <tbody>
                {topComments.map((c, i) => {
                  const sentColor = c.sentiment === "positif" ? TEAL : c.sentiment === "negatif" ? ROSE : SLATE;
                  return (
                    <tr key={c.handle + i} className="border-b border-[#1e2230] last:border-0 align-top">
                      <td className="py-3 pl-4 font-mono text-xs text-[#6f7688]">{i + 1}</td>
                      <td className="py-3 text-[#e8e6df] whitespace-nowrap pr-3">{c.handle}</td>
                      <td className="py-3 text-[#c7cbd6] max-w-md">{c.text}</td>
                      <td className="py-3 text-[#8c94a6] whitespace-nowrap pr-3">{c.platform}</td>
                      <td className="py-3">
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full font-medium capitalize"
                          style={{ color: sentColor, background: `${sentColor}22`, border: `1px solid ${sentColor}55` }}
                        >
                          {c.sentiment}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <span className="inline-flex items-center gap-1 font-mono text-[#d4a94a]">
                          <Heart size={12} strokeWidth={2} />
                          {c.likes.toLocaleString("id-ID")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="pt-4 border-t border-[#2a3040] flex items-center justify-between text-[11px] text-[#6f7688] font-mono">
          <span>SUMBER: DATA SOSMED VIA APIFY · USIA/GENDER/KOTA HASIL ESTIMASI</span>
          <span>DIPERBARUI 23 AGU 2026</span>
        </footer>
      </main>
    </div>
  );
}
