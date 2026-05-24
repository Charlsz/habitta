import { redirect } from "next/navigation";
import { requireOrgRole } from "@/modules/auth/application/auth.guard";

export default async function OrganizationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireOrgRole(id, ["owner", "admin", "member"]);
  redirect(`/dashboard?org=${id}`);
}
