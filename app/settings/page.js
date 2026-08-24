import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/current-user";
import { getCurrentFigure } from "../../lib/current-figure";
import ComingSoonPage from "../../components/ComingSoonPage";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const currentFigure = await getCurrentFigure(user);

  return (
    <ComingSoonPage
      organizationId={user.organization_id}
      organizationName={user.organization_name}
      organizations={user.organizations}
      currentFigureId={currentFigure?.id}
      showRegencyTab={currentFigure?.subject_id === "AJD"}
      username={user.username}
      email={user.email}
      activePage="settings"
      title="Setting"
      description="Pengaturan akun dan organisasi."
    />
  );
}
