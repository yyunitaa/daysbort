import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/current-user";
import { getCurrentFigure } from "../../lib/current-figure";

// Report kini figur-spesifik (lihat app/dashboard/[figureId]/report). Rute
// generik ini cuma jembatan: arahkan ke figur terakhir yang dikunjungi kalau
// ada, atau ke pemilih figur kalau belum ada figur yang dipilih.
export default async function ReportRedirectPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const figure = await getCurrentFigure(user);
  redirect(figure ? `/dashboard/${figure.id}/report` : "/organization/figures");
}
