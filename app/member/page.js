import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/current-user";
import { getCurrentFigure } from "../../lib/current-figure";
import { getPool } from "../../lib/db";
import Sidebar from "../../components/Sidebar";
import MemberManager from "../../components/MemberManager";

export default async function MemberPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const currentFigure = await getCurrentFigure(user);
  const pool = getPool();

  const membersResult = await pool.query(
    `SELECT u.id, u.username, u.email, uo.role,
       COALESCE(array_agg(fa.figure_id) FILTER (WHERE fa.figure_id IS NOT NULL), '{}') AS figure_ids
     FROM public.user_organizations uo
     JOIN public.users u ON u.id = uo.user_id
     LEFT JOIN public.figure_access fa ON fa.user_id = u.id
       AND fa.figure_id IN (SELECT id FROM public.figures WHERE organization_id = $1)
     WHERE uo.organization_id = $1
     GROUP BY u.id, u.username, u.email, uo.role
     ORDER BY u.username`,
    [user.organization_id]
  );
  const members = membersResult.rows.map((r) => ({
    id: r.id,
    username: r.username,
    email: r.email,
    role: r.role,
    figureIds: r.figure_ids,
  }));

  const figuresResult = await pool.query(
    `SELECT id, name FROM public.figures WHERE organization_id = $1 ORDER BY name`,
    [user.organization_id]
  );

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex items-start" style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif" }}>
      <Sidebar
        organizationId={user.organization_id}
        organizationName={user.organization_name}
        organizations={user.organizations}
        currentFigureId={currentFigure?.id}
        showRegencyTab={currentFigure?.subject_id === "AJD"}
        username={user.username}
        email={user.email}
        activePage="member"
      />
      <div className="flex-1 min-w-0 px-6 md:px-10 py-8 max-w-[1400px] mx-auto">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Member</h1>
        <p className="text-sm text-slate-500 mb-6">
          {user.isAdmin
            ? "Kelola akun yang tergabung dalam organisasi ini beserta role dan akses figurnya."
            : "Daftar akun yang tergabung dalam organisasi ini."}
        </p>
        <MemberManager members={members} figures={figuresResult.rows} isAdmin={user.isAdmin} isSuperAdmin={user.isSuperAdmin} currentUserId={user.id} />
      </div>
    </div>
  );
}
