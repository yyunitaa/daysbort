import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "../../../../lib/current-user";
import { getAccessibleFigure } from "../../../../lib/figure-access";
import Sidebar from "../../../../components/Sidebar";
import { cardCls } from "../../../../components/ui";

export default async function FigureReportPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const figureId = Number(params.figureId);
  if (!Number.isInteger(figureId)) notFound();

  const figure = await getAccessibleFigure(user, figureId);
  if (!figure) notFound();

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-start" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Sidebar
        organizationId={user.organization_id}
        organizationName={user.organization_name}
        organizations={user.organizations}
        activePage="report"
        currentFigureId={figureId}
        showRegencyTab={figure.subject_id === "AJD"}
        username={user.username}
        email={user.email}
      />
      <div className="flex-1 min-w-0 px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Report — {figure.name}</h1>
        <p className="text-sm text-slate-500 mb-8">Unduh dan susun laporan ringkasan untuk {figure.name}.</p>
        <div className={`${cardCls} p-10 flex flex-col items-center justify-center text-center gap-2`}>
          <p className="text-sm font-medium text-slate-700">Fitur ini akan segera hadir.</p>
          <p className="text-xs text-slate-400">Kami sedang menyiapkan halaman report untuk {figure.name}.</p>
        </div>
      </div>
    </div>
  );
}
