import { redirect } from "next/navigation";
import { BarChart3, ArrowRight } from "lucide-react";
import { getCurrentUser } from "../../lib/current-user";

export default async function WelcomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const exploreHref = user.organization_id ? "/organization/figures" : "/organization/new";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="flex flex-col items-center text-center max-w-lg">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: "#2563eb14" }}>
          <BarChart3 size={22} color="#2563eb" strokeWidth={2.25} />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Kanalytics</h1>
        <p className="text-base text-slate-500 mt-3">
          Pantau reputasi & percakapan media sosial Anda dalam satu dashboard —
          sentimen, topik, radar risiko, dan audiens, semua dalam satu tempat.
        </p>
        <a
          href={exploreHref}
          className="inline-flex items-center gap-1.5 mt-8 text-sm font-medium text-white bg-[#2563eb] rounded-lg px-6 py-3 hover:bg-blue-700 transition-colors"
        >
          Eksplor
          <ArrowRight size={15} />
        </a>
      </div>
    </div>
  );
}
