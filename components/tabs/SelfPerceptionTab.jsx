"use client";

import React from "react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell, PieChart, Pie, AreaChart, Area, Legend
} from "recharts";
import { Users, MessageCircle, Activity, AlertTriangle, Heart, ShieldAlert } from "lucide-react";
import { KPI, SectionLabel, Callout, cardCls, BLUE, GREEN, RED, GRAY, sentimentColor, chartAxisStyle, chartGridStroke, chartTooltipStyle, ChartTitle, HoverLabel } from "../ui";
import { isWeekInRange, isPlatformMatch } from "../../lib/week-filter";

function EmptyNote({ children = "Belum ada data." }) {
  return <p className="text-xs text-slate-400 italic py-6 text-center">{children}</p>;
}

export default function SelfPerceptionTab({ figureName, data, platform, startDate, endDate }) {
  const {
    kpi, attributionData, platformData: allPlatformData, audienceSegmentData,
    sentimentTrend: allSentimentTrend, volumeTrend: allVolumeTrend, topicEngagement, topTopicsVolume, riskRadar,
    topContent: allTopContent,
  } = data;

  const namaFigur = figureName || "figur ini";
  const positiveCount = Math.round((kpi.relevantMentions * kpi.positivePct) / 100);
  const attributionRows = attributionData.filter((a) => a.tier !== "noise");

  const platformData = allPlatformData.filter((p) => isPlatformMatch(p.platform, platform));
  const sentimentTrend = allSentimentTrend.filter((t) => isWeekInRange(t.week, startDate, endDate));
  const volumeTrend = allVolumeTrend.filter((t) => isWeekInRange(t.week, startDate, endDate));
  const topContent = allTopContent.filter((c) => isPlatformMatch(c.platform, platform));

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPI icon={Users} label="Unggahan yang Benar Tentang Beliau" value={kpi.relevantMentions} sub={kpi.rawMentions > 0 ? `Dari ${kpi.rawMentions.toLocaleString("id-ID")} unggahan yang ditemukan, sebagian besar ternyata bukan tentang ${namaFigur} — nama yang sama banyak dipakai orang lain.` : "Belum ada unggahan yang dipantau untuk figur ini."} accent={BLUE} />
        <KPI icon={MessageCircle} label="Reaksi Warga yang Positif" value={`${kpi.positivePct}%`} sub={kpi.relevantMentions > 0 ? `${positiveCount} dari ${kpi.relevantMentions} unggahan yang benar-benar tentang ${namaFigur} bernada positif.` : "Belum ada data sentimen."} accent={GREEN} />
        <KPI icon={Activity} label="Skor Sentimen Keseluruhan" value={kpi.netSentiment} sub="Skala -100 (sangat negatif) sampai +100 (sangat positif)." accent={GREEN} />
        <KPI icon={ShieldAlert} label="Isu yang Perlu Diperhatikan" value={riskRadar.topicLabel ? "1" : "0"} sub={riskRadar.topicLabel ? `${riskRadar.topicLabel} — kondisinya stabil minggu ini, tidak memburuk.` : "Belum ada isu yang terdeteksi."} accent={RED} />
      </div>

      <section>
        <SectionLabel eyebrow="1" title="Seberapa Bisa Diandalkan Data Ini?" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className={`${cardCls} p-5 lg:col-span-1`}>
            <ChartTitle info="157 unggahan pertama sudah dipastikan tentang beliau. Baris terakhir menyaring unggahan yang menyebut kata kunci wilayah Kolaka — bukan berarti semua otomatis relevan, ini baru penyaringan awal. Arahkan kursor ke tiap baris untuk penjelasannya.">Tingkat Kepastian Unggahan</ChartTitle>
            {attributionRows.length === 0 ? (
              <EmptyNote />
            ) : (
              <div className="flex flex-col gap-3">
                {attributionRows.map((a, i, arr) => {
                  const max = Math.max(...arr.map((x) => x.value));
                  const barColor = a.tier === "review" ? GRAY : BLUE;
                  return (
                    <div key={a.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-xs">
                        <HoverLabel text={a.label} description={a.note} className="text-slate-700" />
                        <span className="font-medium text-slate-500">{a.value.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(a.value / max) * 100}%`, background: barColor }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={`${cardCls} p-5 lg:col-span-1`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Unggahan Berdasarkan Platform</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} vertical={false} />
                <XAxis dataKey="platform" tick={chartAxisStyle} axisLine={{ stroke: chartGridStroke }} tickLine={false} />
                <YAxis tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {platformData.map((_, i) => <Cell key={i} fill={BLUE} fillOpacity={0.5 + (platformData[i].value / 80) * 0.5} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5 lg:col-span-1`}>
            <ChartTitle info="Termasuk unggahan yang belum dipastikan relevan.">Jenis Akun yang Membicarakan</ChartTitle>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={audienceSegmentData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={3}>
                  <Cell fill={BLUE} />
                  <Cell fill={GREEN} />
                  <Cell fill={GRAY} />
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend verticalAlign="bottom" formatter={(val) => <span style={{ color: "#475569", fontSize: 11 }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="2" title="Tren Reaksi Warga per Minggu" />
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
            <ChartTitle info="Lonjakan di akhir Agustus sebagian besar unggahan yang belum dipastikan relevan — jangan buru-buru dianggap tren nyata.">Jumlah Unggahan per Minggu</ChartTitle>
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
        <SectionLabel eyebrow="3" title="Apa Saja yang Dibicarakan Warga?" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`${cardCls} p-5`}>
            <p className="text-sm font-medium mb-4 text-slate-700">Topik yang Paling Menarik Perhatian</p>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={topicEngagement} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridStroke} horizontal={false} />
                <XAxis type="number" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="title" tick={{ fill: "#475569", fontSize: 11 }} width={130} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="eng" radius={[0, 4, 4, 0]} fill={GREEN} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={`${cardCls} p-5 flex flex-col gap-4`}>
            <p className="text-sm font-medium text-slate-700">Topik yang Paling Sering Dibicarakan</p>
            {topTopicsVolume.length === 0 ? (
              <EmptyNote />
            ) : (
              <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 180 }}>
                {topTopicsVolume.map((t) => {
                  const color = sentimentColor(t.net);
                  return (
                    <div key={t.topic} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 last:border-0">
                      <div>
                        <p className="text-slate-800">{t.topic}</p>
                        <p className="text-[11px] text-slate-400">{t.category} &middot; {t.n} unggahan</p>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ color, background: `${color}14` }}>
                        {t.net > 0 ? "+" : ""}{t.net}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
            {riskRadar.topicLabel && (
              <Callout icon={AlertTriangle} color={RED}>
                <span className="font-medium" style={{ color: RED }}>{riskRadar.topicLabel}</span> — ada {riskRadar.nNegativeLast7d} unggahan negatif minggu ini, sama seperti minggu lalu ({riskRadar.nNegativePrior7d}). Kondisinya stabil, tidak memburuk.
              </Callout>
            )}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel eyebrow="4" title="Unggahan yang Paling Berpengaruh" caveat={`Hanya unggahan dari akun resmi atau pernyataan langsung ${namaFigur} — bukan dari akun yang belum tentu terkait.`} />
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
              {topContent.length === 0 ? (
                <tr>
                  <td colSpan={6}><EmptyNote /></td>
                </tr>
              ) : (
                topContent.map((c, i) => {
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
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
