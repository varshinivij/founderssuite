import { redirect } from "next/navigation";

/** Former swipe / “Tinder” feed; matches list is the default tester home. */
export default function TesterFeedRedirectPage() {
  redirect("/tester/matches");
}
