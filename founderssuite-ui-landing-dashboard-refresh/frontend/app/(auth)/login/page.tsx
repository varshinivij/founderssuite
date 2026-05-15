"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("founder");
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Log in</h2>
        <p className="mt-1 text-sm text-slate-600">Welcome back.</p>
      </div>

      <div className="space-y-4">
        {/* Role selector */}
        <div className="space-y-2">
          <Label className="text-slate-700">I am a</Label>
          <div className="flex gap-2">
            {(["founder", "tester"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-lg border px-4 py-2 text-sm font-semibold capitalize transition ${
                  role === r
                    ? "bg-[#8b5cf6] border-[#8b5cf6] text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

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
            await login({ email, password, role });
            router.replace(role === "founder" ? "/founder/dashboard" : "/tester/feed");
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
    </div>
  );
}
