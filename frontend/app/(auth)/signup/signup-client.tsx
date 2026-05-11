"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export default function SignupClient({
  defaultRole,
}: {
  defaultRole: "founder" | "tester";
}) {
  const router = useRouter();
  const { signup } = useAuth();

  const [role, setRole] = useState<"founder" | "tester">(defaultRole);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = useMemo(
    () => (role === "founder" ? "/founder/dashboard" : "/tester/feed"),
    [role]
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold">Create your account</h2>
        <p className="mt-1 text-sm text-neutral-text-gray">
          Sign up to start matching and validating.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <Tabs value={role} onValueChange={(v) => setRole(v as "founder" | "tester")}>
          <TabsList className="bg-bg-card/50 border border-divider rounded-full p-1">
            <TabsTrigger
              value="founder"
              className="rounded-full data-[state=active]:bg-purple"
            >
              Founder
            </TabsTrigger>
            <TabsTrigger
              value="tester"
              className="rounded-full data-[state=active]:bg-purple"
            >
              Tester
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
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
        disabled={!email || !name || password.length < 4 || isSubmitting}
        onClick={async () => {
          setIsSubmitting(true);
          try {
            await signup({ email, name, role, password });
            router.replace(nextPath);
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? "Creating..." : "Create account"}
      </Button>
    </div>
  );
}

