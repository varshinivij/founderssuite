import SignupClient from "./signup-client";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { role?: string };
}) {
  const role =
    searchParams.role === "tester" || searchParams.role === "founder"
      ? (searchParams.role as "founder" | "tester")
      : "founder";

  return <SignupClient defaultRole={role} />;
}

