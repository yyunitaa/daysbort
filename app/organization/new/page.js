import { redirect } from "next/navigation";
import { getCurrentUser } from "../../../lib/current-user";
import NewOrganizationForm from "../../../components/NewOrganizationForm";

export default async function NewOrganizationPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <NewOrganizationForm />
    </div>
  );
}
