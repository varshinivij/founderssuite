"use client";

import { useState } from "react";
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
        <h2 className="text-2xl font-extrabold">Log in</h2>
        <p className="mt-1 text-sm text-neutral-text-gray">
          Welcome back.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
        className="w-full bg-purple hover:bg-purple-mid"
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
    </div>
  );
}

