import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function SignupHubPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const sp = await searchParams;
  if (sp.role === "founder") redirect("/signup/founder");
  if (sp.role === "tester") redirect("/signup/tester");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Sign up</h2>
        <p className="mt-1 text-sm text-slate-600">Choose how you&apos;ll use FoundersSuite.</p>
      </div>
      <div className="grid gap-3">
        <Link
          href="/signup/founder"
          className={cn(
            buttonVariants({ variant: "default", size: "lg" }),
            "h-11 w-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed]",
          )}
        >
          Join as founder
        </Link>
        <Link
          href="/signup/tester"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-11 w-full border-violet-300 text-slate-900 hover:bg-violet-50",
          )}
        >
          Join as tester
        </Link>
      </div>
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-700 hover:text-violet-900">
          Log in
        </Link>
      </p>
    </div>
  );
}
