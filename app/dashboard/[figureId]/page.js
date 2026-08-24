import { redirect, notFound } from "next/navigation";
import DashboardShell from "../../../components/DashboardShell";
import { getCurrentUser } from "../../../lib/current-user";
import { getAccessibleFigure, getAccessibleFigures } from "../../../lib/figure-access";
import { hasRealData, showsRegencyTab } from "../../../lib/subjects";
import { getSelfPerceptionData, getAudienceData, getRiskRadarList } from "../../../lib/live-data";

export default async function DashboardPage({ params }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.organization_id) redirect("/organization/new");

  const figureId = Number(params.figureId);
  if (!Number.isInteger(figureId)) notFound();

  const figure = await getAccessibleFigure(user, figureId);
  if (!figure) notFound();

  const accessibleFigures = await getAccessibleFigures(user);
  const showRegency = showsRegencyTab(figure.subject_id);

  const [selfData, audienceData, regencySelfData, regencyRiskRadar] = await Promise.all([
    getSelfPerceptionData(figure.subject_id, figure.name),
    getAudienceData(figure.subject_id),
    showRegency ? getSelfPerceptionData("KLK", "Kabupaten Kolaka") : null,
    showRegency ? getRiskRadarList("KLK") : null,
  ]);
  const regencyData = regencySelfData ? { ...regencySelfData, riskRadar: regencyRiskRadar } : null;

  return (
    <DashboardShell
      figureId={figure.id}
      figureName={figure.name}
      figureTitle={figure.title}
      subjectId={figure.subject_id}
      isRealData={hasRealData(figure.subject_id)}
      showRegencyTab={showRegency}
      selfData={selfData}
      audienceData={audienceData}
      regencyData={regencyData}
      organizationId={user.organization_id}
      organizationName={user.organization_name}
      organizations={user.organizations}
      username={user.username}
      email={user.email}
      accessibleFigures={accessibleFigures}
    />
  );
}
