"use client";

import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Legend
} from "recharts";
import { Users2, Layers, Radio, ShieldCheck, Heart } from "lucide-react";
import { KPI, SectionLabel, cardCls, BLUE, GREEN, RED, GRAY, chartAxisStyle, chartGridStroke, chartTooltipStyle, ChartTitle } from "../ui";
import { isPlatformMatch } from "../../lib/week-filter";
import * as ajdFollowersData from "../../data/audience-followers-ajd-snapshot";
import * as arrFollowersData from "../../data/audience-followers-arr-snapshot";
import * as bhlFollowersData from "../../data/audience-followers-bhl-snapshot";
import * as marFollowersData from "../../data/audience-followers-mar-snapshot";
import * as emptyFollowersData from "../../data/empty/audience-followers-snapshot";

// Segmen/platform/emosi/pendukung sekarang live query (lib/live-data.js,
// via `data` prop). Data pengikut (followers*) TIDAK bisa jadi live — itu
// hasil scrape Apify nyata (TikTok lewat scripts/pull-followers.mjs, atau
// Instagram lewat scripts/pull-followers-instagram.mjs), bukan bagian dari
// warehouse l1_silver/l2_gold. Subject yang belum pernah di-scrape dapat
// versi kosong (file data/empty/), jujur apa adanya.
const FOLLOWERS_DATA_BY_SUBJECT = {
  AJD: ajdFollowersData,
  ARR: arrFollowersData,
  BHL: bhlFollowersData,
  MAR: marFollowersData,
};

function EmptyNote({ children = "Belum ada data." }) {
  return <p className="text-xs text-slate-400 italic py-6 text-center">{children}</p>;
}

export default function AudienceTab({ figureName, subjectId, data, platform }) {
  const {
    kpi, segmentData, platformActivity: allPlatformActivity, emotionData,
    communitySupporters: allCommunitySupporters, officialAccounts: allOfficialAccounts,
  } = data;
  const {
    followerOverview, followerTiers, followerLocationSignal, topInfluentialFollowers,
    genderData, cityData, ageData,
  } = FOLLOWERS_DATA_BY_SUBJECT[subjectId] || emptyFollowersData;

  const platformActivity = allPlatformActivity.filter((p) => isPlatformMatch(p.platform, platform));
  const communitySupporters = allCommunitySupporters.filter((s) => isPlatformMatch(s.platform, platform));
  const officialAccounts = allOfficialAccounts.filter((a) => isPlatformMatch(a.platform, platform));

  const namaFigur = figureName || "figur ini";
  const segmentTotal = segmentData.reduce((s, r) => s + r.value, 0);
  const segmentPctLabel = segmentTotal > 0
    ? segmentData.map((s) => `${Math.round((s.value / segmentTotal) * 100)}%`).join(" : ")
    : "-";
  const warga = segmentData.find((s) => s.name === "Warga Biasa");
  const resmi = segmentData.find((s) => s.name === "Akun Resmi/Media");

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Users2} label="Calon Anggota Komunitas" value={kpi.communityCandidates} sub={`Akun warga biasa yang komentarnya jelas-jelas mendukung ${namaFigur}.`} accent={BLUE} />
        <KPI icon={Layers} label="Jenis Pengikut" value={segmentPctLabel} sub="Perbandingan warga biasa dengan akun resmi/media." accent={GREEN} />
        <KPI icon={Radio} label="Platform Paling Aktif" value={kpi.topPlatformShare} sub="Platform dengan interaksi terbanyak." accent={BLUE} />
        <KPI icon={ShieldCheck} label="Akun Palsu Terdeteksi" value={kpi.botDetected} sub={kpi.botDetected === 0 ? "Tidak ada akun yang terlihat mencurigakan." : "Akun yang terindikasi bot/buzzer."} accent={GREEN} />
      </div>

      <section>
        <SectionLabel eyebrow="1" title="Data Pengikut" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardCls} p-5`}>
            <ChartTitle info={`Sebaran ukuran akun pengikut ${namaFigur} berdasarkan jumlah pengikut mereka.`}>Ukuran Akun Pengikut (berdasarkan jumlah pengikut mereka)</ChartTitle>
            {followerTiers.length === 0 ? (
              <EmptyNote />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={followerTiers} margin={{ left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                  <XAxis dataKey="tier" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                  <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={BLUE} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`${cardCls} p-5`}>
            <ChartTitle info={followerLocationSignal.topLocalKeywords.length > 0 ? `Kata yang paling sering muncul: ${followerLocationSignal.topLocalKeywords.map((k) => `"${k.keyword}" (${k.n})`).join(", ")}. Coverage rendah — jangan dibaca sebagai peta domisili pengikut.` : "Belum ada sinyal lokasi dari bio pengikut."}>Lokasi yang Disebut di Bio</ChartTitle>
            {followerOverview.totalSampled <= 1 && followerLocationSignal.noLocationInfo === 0 ? (
              <EmptyNote />
            ) : (
              <div className="flex flex-col gap-3 mt-2">
                {[
                  ...(followerLocationSignal.localMentioned > 0 || subjectId === "AJD"
                    ? [{ label: "Menyebut Kolaka/Sultra", value: followerLocationSignal.localMentioned, color: GREEN }]
                    : []),
                  { label: "Menyebut kota/wilayah lain", value: followerLocationSignal.otherCityMentioned, color: GRAY },
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
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="2" title="Pengikut dengan Pengaruh Terbesar" />
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
              {topInfluentialFollowers.length === 0 ? (
                <tr><td colSpan={4}><EmptyNote /></td></tr>
              ) : (
                topInfluentialFollowers.map((f, i) => (
                  <tr key={f.handle} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="py-2.5 pl-4 text-xs text-slate-400">{i + 1}</td>
                    <td className="py-2.5 text-slate-800 font-medium whitespace-nowrap pr-3">{f.handle} <span className="text-slate-400 font-normal">({f.nickname})</span></td>
                    <td className="py-2.5 text-slate-500 max-w-md">{f.bio || "—"}</td>
                    <td className="py-2.5 pr-4 text-right font-medium text-slate-700">{f.fans.toLocaleString("id-ID")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="3" title="Jenis Warga yang Berkomentar" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardCls} p-5`}>
            <ChartTitle info={warga && resmi ? `Akun resmi/media rata-rata punya ${resmi.avgFollowers.toLocaleString("id-ID")} pengikut; warga biasa rata-rata ${warga.avgFollowers.toLocaleString("id-ID")}.` : "Belum ada data segmen audiens."}>Jenis Akun yang Berkomentar</ChartTitle>
            {segmentData.length === 0 ? (
              <EmptyNote />
            ) : (
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
            )}
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Aktivitas per Platform</p>
            {platformActivity.length === 0 ? (
              <EmptyNote />
            ) : (
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
            )}
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Emosi dalam Komentar</p>
            {emotionData.length === 0 ? (
              <EmptyNote />
            ) : (
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
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="4" title="Analisis Usia, Jenis Kelamin & Kota" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Analisis Usia</p>
            {ageData.length === 0 ? (
              <EmptyNote />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ageData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                  <XAxis dataKey="range" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                  <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={GRAY} fillOpacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Analisis Jenis Kelamin</p>
            {genderData.length === 0 ? (
              <EmptyNote />
            ) : (
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
            )}
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Analisis Kota Asal</p>
            {cityData.length === 0 ? (
              <EmptyNote />
            ) : (
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
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="5" title="Calon Anggota Komunitas Pendukung" caveat={`Akun warga biasa (bukan instansi resmi) yang komentarnya jelas-jelas mendukung ${namaFigur}.`} />
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
              {communitySupporters.length === 0 ? (
                <tr><td colSpan={6}><EmptyNote /></td></tr>
              ) : (
                communitySupporters.map((s, i) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="6" title="Akun Resmi & Media Lokal Paling Aktif" caveat={`Ini bukan komunitas warga biasa, tapi jadi saluran utama penyebaran berita positif tentang ${namaFigur}.`} />
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
              {officialAccounts.length === 0 ? (
                <tr><td colSpan={4}><EmptyNote /></td></tr>
              ) : (
                officialAccounts.map((a) => (
                  <tr key={a.handle} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 pl-4 text-slate-800 font-medium">{a.handle}</td>
                    <td className="py-2.5 text-slate-500">{a.platform}</td>
                    <td className="py-2.5 text-right text-slate-600">{a.posts}</td>
                    <td className="py-2.5 pr-4 text-right font-medium" style={{ color: BLUE }}>{a.engagement.toLocaleString("id-ID")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
