import { redirect } from "next/navigation";

/** Former "Manage testers" roster; matches are the primary founder queue now. */
export default function FounderFormsIndexPage() {
  redirect("/founder/matches");
}
