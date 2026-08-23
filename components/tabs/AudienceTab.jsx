"use client";

import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Legend
} from "recharts";
import { Users2, Layers, Radio, ShieldCheck, Heart, MapPin, Sparkles } from "lucide-react";
import { KPI, SectionLabel, cardCls, BLUE, GREEN, RED, GRAY, chartAxisStyle, chartGridStroke, chartTooltipStyle, ChartTitle } from "../ui";
import {
  kpi, segmentData, platformActivity, emotionData, communitySupporters, officialAccounts,
} from "../../data/audience-snapshot";
import {
  followerOverview, followerTiers, followerLocationSignal, topInfluentialFollowers,
  genderData, cityData, ageData,
} from "../../data/audience-followers-snapshot";

export default function AudienceTab() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Users2} label="Calon Anggota Komunitas" value={kpi.communityCandidates} sub="Akun warga biasa yang komentarnya jelas-jelas mendukung Bapak Amri." accent={BLUE} />
        <KPI icon={Layers} label="Jenis Pengikut" value="52% : 48%" sub="Perbandingan warga biasa dengan akun resmi/media." accent={GREEN} />
        <KPI icon={Radio} label="Platform Paling Aktif" value={kpi.topPlatformShare} sub="TikTok adalah platform dengan interaksi terbanyak." accent={BLUE} />
        <KPI icon={ShieldCheck} label="Akun Palsu Terdeteksi" value={kpi.botDetected} sub="Semua akun yang dianalisis terlihat asli, bukan bot." accent={GREEN} />
      </div>

      <section>
        <SectionLabel eyebrow="1" title="Data Pengikut TikTok (5.000 Sampel Nyata)" caveat="Sumber: penarikan data resmi dari akun @amrijamaluddin_, 23 Agustus 2026." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <KPI icon={Users2} label="Pengikut yang Dianalisis" value={followerOverview.totalSampled.toLocaleString("id-ID")} sub="Dari total pengikut akun TikTok Bapak Amri." accent={BLUE} />
          <KPI icon={ShieldCheck} label="Akun Privat" value={`${followerOverview.privateAccountPct}%`} sub="Pengikut yang akunnya di-private." accent={GRAY} />
          <KPI icon={Sparkles} label="Rata-rata Pengikut per Akun" value={followerOverview.avgFans} sub={`Umumnya ${followerOverview.medianFans} — kebanyakan pengikutnya akun kecil.`} accent={GREEN} />
          <KPI icon={MapPin} label="Menyebut Lokasi di Bio" value={`${((followerLocationSignal.localMentioned / followerOverview.totalSampled) * 100).toFixed(1)}%`} sub="Bio yang menyebut Kolaka/Sultra — jumlahnya masih sedikit." accent={BLUE} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardCls} p-5`}>
            <ChartTitle info="99% pengikut Bapak Amri adalah akun kecil/menengah (kurang dari 10 ribu pengikut) — bukan didominasi akun besar/buzzer.">Ukuran Akun Pengikut (berdasarkan jumlah pengikut mereka)</ChartTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={followerTiers} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="tier" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={BLUE} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <ChartTitle info={`Kata yang paling sering muncul: ${followerLocationSignal.topLocalKeywords.map((k) => `"${k.keyword}" (${k.n})`).join(", ")}. 96,5% bio tidak menyebut lokasi sama sekali — jangan dibaca sebagai peta domisili pengikut.`}>Lokasi yang Disebut di Bio (perkiraan kasar)</ChartTitle>
            <div className="flex flex-col gap-3 mt-2">
              {[
                { label: "Menyebut Kolaka/Sultra", value: followerLocationSignal.localMentioned, color: GREEN },
                { label: "Menyebut kota lain", value: followerLocationSignal.otherCityMentioned, color: GRAY },
                { label: "Tidak menyebut lokasi", value: followerLocationSignal.noLocationInfo, color: "#e2e8f0" },
              ].map((row) => (
                <div key={row.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700">{row.label}</span>
                    <span className="font-medium text-slate-500">{row.value.toLocaleString("id-ID")} ({((row.value / followerOverview.totalSampled) * 100).toFixed(1)}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(row.value / followerOverview.totalSampled) * 100}%`, background: row.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="2" title="Pengikut dengan Pengaruh Terbesar" caveat="Perhatian: sebagian besar akun besar ini isinya TIDAK berhubungan dengan Bapak Amri sama sekali (misalnya konten hiburan, review, atau olahraga) — kemungkinan mereka mengikuti secara otomatis, bukan karena mendukung beliau." />
        <div className={`${cardCls} p-2`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="text-left font-medium py-2.5 pl-4">#</th>
                <th className="text-left font-medium py-2.5">Akun</th>
                <th className="text-left font-medium py-2.5">Bio</th>
                <th className="text-right font-medium py-2.5 pr-4">Pengikut</th>
              </tr>
            </thead>
            <tbody>
              {topInfluentialFollowers.map((f, i) => (
                <tr key={f.handle} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="py-2.5 pl-4 text-xs text-slate-400">{i + 1}</td>
                  <td className="py-2.5 text-slate-800 font-medium whitespace-nowrap pr-3">{f.handle} <span className="text-slate-400 font-normal">({f.nickname})</span></td>
                  <td className="py-2.5 text-slate-500 max-w-md">{f.bio || "—"}</td>
                  <td className="py-2.5 pr-4 text-right font-medium text-slate-700">{f.fans.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="3" title="Jenis Warga yang Berkomentar" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardCls} p-5`}>
            <ChartTitle info={`Akun resmi/media rata-rata punya ${segmentData[1].avgFollowers.toLocaleString("id-ID")} pengikut; warga biasa rata-rata ${segmentData[0].avgFollowers.toLocaleString("id-ID")}.`}>Jenis Akun yang Berkomentar</ChartTitle>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={segmentData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  <Cell fill={BLUE} />
                  <Cell fill={GREEN} />
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend verticalAlign="bottom" formatter={(val) => <span style={{ color: "#475569", fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Aktivitas per Platform</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={platformActivity} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="platform" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {platformActivity.map((_, i) => <Cell key={i} fill={BLUE} fillOpacity={0.5 + (platformActivity[i].value / 80) * 0.5} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Emosi dalam Komentar</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={emotionData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                <XAxis type="number" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="emotion" tick={{ fill: "#475569", fontSize: 11 }} width={70} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {emotionData.map((e, i) => (
                    <Cell key={i} fill={e.emotion === "Dukungan" ? GREEN : e.emotion === "Marah" || e.emotion === "Kecewa" ? RED : GRAY} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="4" title="Perkiraan Usia, Jenis Kelamin & Kota" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Perkiraan Usia</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ageData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="range" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={GRAY} fillOpacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Perkiraan Jenis Kelamin</p>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  <Cell fill={BLUE} />
                  <Cell fill={GREEN} />
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend verticalAlign="bottom" formatter={(val) => <span style={{ color: "#475569", fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Perkiraan Kota Asal</p>
            <div className="flex flex-col gap-2.5">
              {cityData.map((c, i) => {
                const max = cityData[0].value;
                return (
                  <div key={c.city} className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 w-4">{i + 1}</span>
                    <span className="text-xs text-slate-700 w-28 truncate">{c.city}</span>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(c.value / max) * 100}%`, background: BLUE }} />
                    </div>
                    <span className="text-[11px] text-slate-500 w-10 text-right">{((c.value / followerOverview.totalSampled) * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="5" title="Calon Anggota Komunitas Pendukung" caveat="Akun warga biasa (bukan instansi resmi) yang komentarnya jelas-jelas mendukung Bapak Amri — ini titik awal untuk membangun komunitas pendukung, bukan daftar lengkap." />
        <div className={`${cardCls} p-2`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="text-left font-medium py-2.5 pl-4">#</th>
                <th className="text-left font-medium py-2.5">Akun</th>
                <th className="text-left font-medium py-2.5">Platform</th>
                <th className="text-right font-medium py-2.5">Pengikut</th>
                <th className="text-left font-medium py-2.5">Komentar</th>
                <th className="text-right font-medium py-2.5 pr-4">Suka</th>
              </tr>
            </thead>
            <tbody>
              {communitySupporters.map((s, i) => (
                <tr key={s.handle + i} className="border-b border-slate-100 last:border-0 align-top">
                  <td className="py-3 pl-4 text-xs text-slate-400">{i + 1}</td>
                  <td className="py-3 text-slate-800 font-medium whitespace-nowrap pr-3">{s.handle}</td>
                  <td className="py-3 text-slate-500 whitespace-nowrap pr-3">{s.platform}</td>
                  <td className="py-3 text-right text-slate-600">{s.followers ? s.followers.toLocaleString("id-ID") : "—"}</td>
                  <td className="py-3 text-slate-600 max-w-md">{s.text}</td>
                  <td className="py-3 pr-4 text-right">
                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                      <Heart size={12} strokeWidth={2} />
                      {s.likes.toLocaleString("id-ID")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="6" title="Akun Resmi & Media Lokal Paling Aktif" caveat="Ini bukan komunitas warga biasa, tapi jadi saluran utama penyebaran berita positif tentang Bapak Amri." />
        <div className={`${cardCls} p-2`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="text-left font-medium py-2.5 pl-4">Akun</th>
                <th className="text-left font-medium py-2.5">Platform</th>
                <th className="text-right font-medium py-2.5">Jumlah Unggahan</th>
                <th className="text-right font-medium py-2.5 pr-4">Total Interaksi</th>
              </tr>
            </thead>
            <tbody>
              {officialAccounts.map((a) => (
                <tr key={a.handle} className="border-b border-slate-100 last:border-0">
                  <td className="py-2.5 pl-4 text-slate-800 font-medium">{a.handle}</td>
                  <td className="py-2.5 text-slate-500">{a.platform}</td>
                  <td className="py-2.5 text-right text-slate-600">{a.posts}</td>
                  <td className="py-2.5 pr-4 text-right font-medium" style={{ color: BLUE }}>{a.engagement.toLocaleString("id-ID")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
