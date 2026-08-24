import { redirect } from "next/navigation";
import { UserRound, ArrowRight, Lock } from "lucide-react";
import { getCurrentUser } from "../../../lib/current-user";
import { getPool } from "../../../lib/db";
import AddFigureForm from "../../../components/AddFigureForm";
import Sidebar from "../../../components/Sidebar";
import { getCurrentFigure } from "../../../lib/current-figure";

export default async function FiguresPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const pool = getPool();
  let figures;

  if (user.isSuperAdmin) {
    // Akses penuh — semua figur, semua bisa diklik.
    const result = await pool.query(
      `SELECT id, name, title FROM public.figures WHERE organization_id = $1 ORDER BY name`,
      [user.organization_id]
    );
    figures = result.rows.map((f) => ({ ...f, accessible: true }));
  } else if (user.isAdmin) {
    // Admin (bukan super_admin): lihat semua figur, tapi cuma bisa masuk ke
    // yang di-checklist-kan — sisanya tetap kelihatan, abu-abu/gak bisa diklik.
    const [allFigures, access] = await Promise.all([
      pool.query(`SELECT id, name, title FROM public.figures WHERE organization_id = $1 ORDER BY name`, [user.organization_id]),
      pool.query(`SELECT figure_id FROM public.figure_access WHERE user_id = $1`, [user.id]),
    ]);
    const accessSet = new Set(access.rows.map((r) => r.figure_id));
    figures = allFigures.rows.map((f) => ({ ...f, accessible: accessSet.has(f.id) }));
  } else {
    // Member: cuma lihat figur yang di-checklist-kan, sisanya disembunyikan.
    const result = await pool.query(
      `SELECT f.id, f.name, f.title FROM public.figures f
       JOIN public.figure_access fa ON fa.figure_id = f.id AND fa.user_id = $2
       WHERE f.organization_id = $1 ORDER BY f.name`,
      [user.organization_id, user.id]
    );
    figures = result.rows.map((f) => ({ ...f, accessible: true }));
  }

  const currentFigure = await getCurrentFigure(user);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-start" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Sidebar organizationId={user.organization_id} organizationName={user.organization_name} organizations={user.organizations} activePage="figures" currentFigureId={currentFigure?.id} showRegencyTab={currentFigure?.subject_id === "AJD"} username={user.username} email={user.email} />
      <div className="flex-1 min-w-0 px-6 md:px-10 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Pilih Figur</h1>
          <p className="text-slate-500 text-sm mb-8">
            {user.isAdmin ? "Pilih figur yang ingin Anda pantau di dashboard." : "Figur yang bisa Anda akses (view only)."}
          </p>

          {user.isAdmin && figures.length === 0 && (
            <p className="text-sm text-slate-500 mb-4">
              Organisasi ini belum punya figur. Buat figur dulu supaya bisa mulai pantau dashboard & report-nya.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {figures.map((f) =>
              f.accessible ? (
                <a
                  key={f.id}
                  href={`/dashboard/${f.id}`}
                  className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-4 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#2563eb14" }}>
                    <UserRound size={18} color="#2563eb" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate">{f.name}</p>
                    {f.title && <p className="text-xs text-slate-500 truncate">{f.title}</p>}
                  </div>
                  <ArrowRight size={15} className="text-slate-400 shrink-0" />
                </a>
              ) : (
                <div
                  key={f.id}
                  title="Anda tidak punya akses untuk figur ini"
                  className="bg-slate-50 border border-[#e2e8f0] rounded-xl p-5 flex items-center gap-4 opacity-60 cursor-not-allowed select-none"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-slate-200">
                    <UserRound size={18} color="#94a3b8" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-400 text-sm truncate">{f.name}</p>
                    {f.title && <p className="text-xs text-slate-400 truncate">{f.title}</p>}
                  </div>
                  <Lock size={14} className="text-slate-400 shrink-0" />
                </div>
              )
            )}
            {user.isAdmin && <AddFigureForm />}
          </div>
          {!user.isAdmin && figures.length === 0 && (
            <p className="text-sm text-slate-400 mt-2">Belum ada figur yang bisa Anda akses. Hubungi admin organisasi.</p>
          )}
        </div>
      </div>
    </div>
  );
}
