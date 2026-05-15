"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Log in</h2>
        <p className="mt-1 text-sm text-slate-600">Welcome back.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700">
            Email
          </Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <Button
        className="h-10 w-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
        disabled={!email || password.length < 4 || isSubmitting}
        onClick={async () => {
          setIsSubmitting(true);
          try {
            await login({ email, password });
            const raw = window.localStorage.getItem("founderssuite.auth.user");
            const parsed = raw ? (JSON.parse(raw) as { role?: "founder" | "tester" }) : null;
            const role = parsed?.role ?? "tester";
            router.replace(role === "founder" ? "/founder/dashboard" : "/tester/matches");
            toast.success("Signed in");
          } catch (e: unknown) {
            toast.error("Sign in failed", {
              description: e instanceof Error ? e.message : "Unknown error",
            });
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>

      <div className="border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
        <p>New here?</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <Link href="/signup/founder" className="font-semibold text-violet-700 hover:text-violet-900">
            Join as founder
          </Link>
          <span className="text-slate-400" aria-hidden>
            ·
          </span>
          <Link href="/signup/tester" className="font-semibold text-violet-700 hover:text-violet-900">
            Join as tester
          </Link>
        </p>
      </div>
    </div>
  );
}

