import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  MessageCircle,
  ShieldAlert,
  Users,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Analisis Sentimen",
    desc: "Pantau sentimen positif, netral, dan negatif dari waktu ke waktu, lengkap dengan tren mingguan.",
  },
  {
    icon: MessageCircle,
    title: "Pemetaan Topik",
    desc: "Lihat topik dan isu apa saja yang paling banyak dibicarakan warganet di setiap platform.",
  },
  {
    icon: ShieldAlert,
    title: "Radar Risiko",
    desc: "Dapatkan sinyal dini saat volume sentimen negatif melonjak, sebelum jadi krisis besar.",
  },
  {
    icon: Users,
    title: "Audiens & Komunitas",
    desc: "Kenali segmen audiens, akun pendukung, dan aktivitas komunitas di berbagai platform sosial.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      {/* Nav */}
      <header className="border-b border-[#e2e8f0] bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#2563eb14" }}>
              <BarChart3 size={16} color="#2563eb" strokeWidth={2.25} />
            </div>
            <span className="font-semibold text-slate-900">Kanalytics</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium text-white bg-[#2563eb] rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-6"
          style={{ background: "#2563eb14", color: "#2563eb" }}
        >
          Social Media Intelligence
        </span>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Pantau reputasi & percakapan media sosial Anda dalam satu dashboard
        </h1>
        <p className="text-base md:text-lg text-slate-500 max-w-xl mx-auto mt-5">
          Kanalytics mengumpulkan dan menganalisis mention dari Instagram, TikTok,
          X, dan YouTube — sentimen, topik, risiko, dan audiens, semua dalam satu
          tempat.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-[#2563eb] rounded-lg px-5 py-3 hover:bg-blue-700 transition-colors"
          >
            Daftar Gratis
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-700 bg-white border border-[#e2e8f0] rounded-lg px-5 py-3 hover:bg-slate-50 transition-colors"
          >
            Masuk
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-28">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Semua yang Anda butuhkan untuk memahami audiens</h2>
          <p className="text-slate-500 mt-3">Empat sudut pandang utama, dari sentimen sampai komunitas pendukung.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex flex-col gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "#2563eb14" }}>
                <Icon size={17} color="#2563eb" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-20 md:pb-28">
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-8 py-12 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Siap pantau reputasi Anda di media sosial?</h2>
          <p className="text-slate-500 mt-2">Buat akun dan mulai lihat datanya di dashboard.</p>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-white bg-[#2563eb] rounded-lg px-5 py-3 hover:bg-blue-700 transition-colors"
          >
            Daftar Gratis
            <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-[#e2e8f0] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} Kanalytics</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-slate-600">Masuk</Link>
            <Link href="/register" className="hover:text-slate-600">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
