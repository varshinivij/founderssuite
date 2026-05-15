import { notFound } from "next/navigation";
import { getTesterCompanyProfile, listTesterCompanyFormIds } from "@/lib/tester-company-profiles";
import TesterCompanyProfileView from "@/components/tester/TesterCompanyProfileView";

export function generateStaticParams() {
  return listTesterCompanyFormIds().map((formId) => ({ formId }));
}

export default async function TesterCompanyProfilePage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const profile = getTesterCompanyProfile(formId);
  if (!profile) notFound();

  return <TesterCompanyProfileView profile={profile} />;
}
