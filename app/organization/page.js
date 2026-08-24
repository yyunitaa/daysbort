import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { getCurrentUser } from "../../lib/current-user";
import { getPool } from "../../lib/db";
import Sidebar from "../../components/Sidebar";
import OtherOrganizationsList from "../../components/OtherOrganizationsList";
import { cardCls } from "../../components/ui";
import { getCurrentFigure } from "../../lib/current-figure";

export default async function OrganizationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const currentFigure = await getCurrentFigure(user);
  const pool = getPool();
  const figureCount = await pool.query(
    `SELECT count(*) n FROM public.figures WHERE organization_id = $1`,
    [user.organization_id]
  );
  const memberCount = await pool.query(
    `SELECT count(*) n FROM public.users WHERE organization_id = $1`,
    [user.organization_id]
  );

  const otherOrganizations = user.organizations.filter((o) => o.id !== user.organization_id);

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-start" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Sidebar organizationId={user.organization_id} organizationName={user.organization_name} organizations={user.organizations} activePage="organization" currentFigureId={currentFigure?.id} showRegencyTab={currentFigure?.subject_id === "AJD"} username={user.username} email={user.email} />
      <div className="flex-1 min-w-0 px-6 md:px-10 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Organisasi</h1>
          <p className="text-slate-500 text-sm mb-8">Organisasi aktif dan organisasi lain yang Anda ikuti.</p>

          <p className="text-xs font-medium text-slate-500 mb-2">Organisasi aktif</p>
          <div className={`${cardCls} p-6 flex items-center gap-4`}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#2563eb14" }}>
              <Building2 size={20} color="#2563eb" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user.organization_name}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {figureCount.rows[0].n} figur &middot; {memberCount.rows[0].n} akun tergabung
              </p>
            </div>
          </div>

          <OtherOrganizationsList organizations={otherOrganizations} />
        </div>
      </div>
    </div>
  );
}
