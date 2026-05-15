import { useParams } from "react-router";
import { getTesterCompanyProfile } from "../lib/testerCompanyProfiles";
import TesterCompanyProfileView from "../components/tester/TesterCompanyProfileView";

export default function TesterCompanyView() {
  const { formId } = useParams<{ formId: string }>();
  const profile = formId ? getTesterCompanyProfile(formId) : undefined;

  if (!profile) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 py-12 text-center text-sm text-slate-600">
        Company profile not found.
      </div>
    );
  }

  return <TesterCompanyProfileView profile={profile} />;
}
