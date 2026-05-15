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
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-600">Sign up to start matching and validating.</p>
      </div>

      <div className="space-y-2">
        <Label className="text-slate-700">Role</Label>
        <Tabs value={role} onValueChange={(v) => setRole(v as "founder" | "tester")}>
          <TabsList className="grid w-full grid-cols-2 rounded-full border border-violet-200 bg-violet-50/90 p-1">
            <TabsTrigger
              value="founder"
              className="rounded-full text-slate-600 data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Founder
            </TabsTrigger>
            <TabsTrigger
              value="tester"
              className="rounded-full text-slate-600 data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white data-[state=active]:shadow-sm"
            >
              Tester
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700">
            Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
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

