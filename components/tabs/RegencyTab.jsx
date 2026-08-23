"use client";

import React from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, AreaChart, Area
} from "recharts";
import { Building2, MessageCircle, Activity, TrendingDown, TrendingUp, Heart } from "lucide-react";
import { KPI, SectionLabel, cardCls, BLUE, GREEN, RED, GRAY, sentimentColor, HoverLabel, chartAxisStyle, chartGridStroke, chartTooltipStyle, BORDER, ChartTitle } from "../ui";
import {
  kpi, platformData, sentimentTrend, volumeTrend, topicEngagement, topTopicsVolume, riskRadar, topContent,
} from "../../data/klk-snapshot";
import { getTopicDescription } from "../../data/topic-descriptions";

function TopicEngagementTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const row = payload[0].payload;
  const desc = getTopicDescription(row.title);
  return (
    <div className="rounded-lg p-3 text-xs max-w-[240px] bg-white shadow-lg" style={{ border: `1px solid ${BORDER}` }}>
      <p className="text-slate-800 font-medium mb-1">{row.title}</p>
      <p className="font-medium mb-1" style={{ color: BLUE }}>Rata-rata ketertarikan warga: {row.eng}</p>
      {desc && <p className="text-slate-500 leading-relaxed">{desc}</p>}
    </div>
  );
}

export default function RegencyTab() {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Building2} label="Unggahan yang Benar Tentang Kolaka" value={kpi.relevantMentions.toLocaleString("id-ID")} sub={`Dari ${kpi.rawMentions.toLocaleString("id-ID")} unggahan yang ditemukan. Nama "Kolaka" lebih mudah dipastikan dibanding nama pribadi, jadi datanya lebih akurat.`} accent={BLUE} />
        <KPI icon={MessageCircle} label="Reaksi Warga yang Positif" value={`${kpi.positivePct}%`} sub="801 dari 1.343 unggahan bernada positif tentang Kolaka." accent={GREEN} />
        <KPI icon={Activity} label="Skor Sentimen Keseluruhan" value={kpi.netSentiment} sub="Skala -100 sampai +100 — tergolong cukup baik." accent={GREEN} />
        <KPI icon={TrendingDown} label="Isu yang Mulai Mereda" value="Sengketa Lahan Tambang" sub="Unggahan negatif turun drastis: dari 39 jadi hanya 1 per minggu." accent={GREEN} />
      </div>

      <section>
        <SectionLabel eyebrow="1" title="Unggahan Berdasarkan Platform" />
        <div className={`${cardCls} p-5`}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={platformData} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
              <XAxis dataKey="platform" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
              <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {platformData.map((_, i) => <Cell key={i} fill={BLUE} fillOpacity={0.5 + (platformData[i].value / 633) * 0.5} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="2" title="Tren Reaksi Warga per Minggu" caveat="Lonjakan jumlah unggahan akhir Juli bertepatan dengan puncak isu sengketa lahan tambang." />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Reaksi Warga dari Minggu ke Minggu</p>
            <ResponsiveContainer width="100%" height={230}>
              <AreaChart data={sentimentTrend} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="week" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Area type="monotone" dataKey="positif" stackId="1" stroke={GREEN} fill={GREEN} fillOpacity={0.5} />
                <Area type="monotone" dataKey="netral" stackId="1" stroke={GRAY} fill={GRAY} fillOpacity={0.3} />
                <Area type="monotone" dataKey="negatif" stackId="1" stroke={RED} fill={RED} fillOpacity={0.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Jumlah Unggahan per Minggu</p>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={volumeTrend} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="week" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="volume" stroke={BLUE} strokeWidth={2} dot={{ r: 3, fill: BLUE }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="3" title="Isu-Isu di Kabupaten Kolaka" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardCls} p-5`}>
            <ChartTitle info="Arahkan kursor ke batang untuk melihat penjelasan topiknya.">Topik yang Paling Menarik Perhatian</ChartTitle>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topicEngagement} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                <XAxis type="number" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="title" tick={{ fill: "#475569", fontSize: 11 }} width={150} axisLine={false} tickLine={false} />
                <Tooltip content={<TopicEngagementTooltip />} cursor={{ fill: "#2563eb08" }} />
                <Bar dataKey="eng" radius={[0, 4, 4, 0]} fill={GREEN} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5`}>
            <ChartTitle info="Arahkan kursor ke nama topik untuk melihat penjelasan singkatnya.">Topik yang Paling Sering Dibicarakan</ChartTitle>
            <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 250 }}>
              {topTopicsVolume.map((t) => {
                const color = sentimentColor(t.net);
                return (
                  <div key={t.topic} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 last:border-0">
                    <div>
                      <HoverLabel text={t.topic} description={getTopicDescription(t.topic)} className="text-slate-800" />
                      <p className="text-[11px] text-slate-400">{t.category} &middot; {t.n} unggahan</p>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color, background: `${color}14` }}>
                      {t.net > 0 ? "+" : ""}{t.net}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={`${cardCls} p-5 mt-4`}>
          <ChartTitle info="Arahkan kursor ke nama topik untuk penjelasan singkat. Angka di sini menunjukkan arah tren, bukan kecepatan perubahan secara langsung (real-time).">Isu yang Sedang Naik atau Turun (7 Hari Terakhir)</ChartTitle>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                  <th className="text-left font-medium pb-2">Topik</th>
                  <th className="text-left font-medium pb-2">Kategori</th>
                  <th className="text-right font-medium pb-2">7 Hari Lalu</th>
                  <th className="text-right font-medium pb-2">7 Hari Ini</th>
                  <th className="text-right font-medium pb-2 pr-2">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {riskRadar.map((r) => {
                  const rising = r.delta > 0;
                  const color = r.delta > 0 ? RED : r.delta < 0 ? GREEN : GRAY;
                  return (
                    <tr key={r.topic} className="border-b border-slate-100 last:border-0">
                      <td className="py-2.5 text-slate-800"><HoverLabel text={r.topic} description={getTopicDescription(r.topic)} /></td>
                      <td className="py-2.5 text-slate-500">{r.category}</td>
                      <td className="py-2.5 text-right text-slate-600">{r.prior7d}</td>
                      <td className="py-2.5 text-right text-slate-600">{r.last7d}</td>
                      <td className="py-2.5 pr-2 text-right">
                        <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
                          {rising ? <TrendingUp size={12} /> : r.delta < 0 ? <TrendingDown size={12} /> : null}
                          {r.delta > 0 ? "+" : ""}{r.delta}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="4" title="Unggahan yang Paling Berpengaruh" caveat="Termasuk unggahan viral yang tidak terkait pemerintahan (misalnya kisah warga) tapi tetap menyebut nama Kolaka." />
        <div className={`${cardCls} p-2`}>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                <th className="text-left font-medium py-2.5 pl-4">#</th>
                <th className="text-left font-medium py-2.5">Akun</th>
                <th className="text-left font-medium py-2.5">Isi Unggahan</th>
                <th className="text-left font-medium py-2.5">Platform</th>
                <th className="text-left font-medium py-2.5">Reaksi</th>
                <th className="text-right font-medium py-2.5 pr-4">Suka</th>
              </tr>
            </thead>
            <tbody>
              {topContent.map((c, i) => {
                const sentColor = c.sentiment === "positif" ? GREEN : c.sentiment === "negatif" ? RED : GRAY;
                return (
                  <tr key={c.handle + i} className="border-b border-slate-100 last:border-0 align-top">
                    <td className="py-3 pl-4 text-xs text-slate-400">{i + 1}</td>
                    <td className="py-3 text-slate-800 font-medium whitespace-nowrap pr-3">{c.handle}</td>
                    <td className="py-3 text-slate-600 max-w-md">{c.text}</td>
                    <td className="py-3 text-slate-500 whitespace-nowrap pr-3">{c.platform}</td>
                    <td className="py-3">
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium capitalize" style={{ color: sentColor, background: `${sentColor}14` }}>
                        {c.sentiment}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <span className="inline-flex items-center gap-1 font-medium text-slate-600">
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
    </div>
  );
}
