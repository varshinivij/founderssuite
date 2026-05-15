import SignupClient from "./signup-client";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  const role =
    sp.role === "tester" || sp.role === "founder"
      ? (sp.role as "founder" | "tester")
      : "founder";

  return <SignupClient defaultRole={role} />;
}

