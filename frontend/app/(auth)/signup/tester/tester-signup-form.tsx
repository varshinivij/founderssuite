"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INDUSTRY_OPTIONS } from "@/lib/industry-options";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function TesterSignupForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [industries, setIndustries] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleIndustry = (value: string) => {
    setIndustries((prev) =>
      prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value],
    );
  };

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      shortBio.trim().length > 0 &&
      industries.length > 0 &&
      email.trim().length > 0 &&
      password.length >= 4
    );
  }, [name, shortBio, industries, email, password]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Testers</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h2>
        <p className="mt-1 text-sm text-slate-600">Share a bit about your background and the spaces you can validate.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ts-name" className="text-slate-700">
            Name
          </Label>
          <Input id="ts-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ts-bio" className="text-slate-700">
            Short bio
          </Label>
          <textarea
            id="ts-bio"
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            placeholder="What you do today, domains you've shipped in, and how you like to give feedback."
            rows={3}
            className={cn(
              "min-h-[88px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-700">Industry (select all that apply)</Label>
          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map((opt) => {
              const on = industries.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleIndustry(opt)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    on
                      ? "border-violet-500 bg-violet-600 text-white shadow-sm"
                      : "border-violet-200 bg-violet-50/80 text-slate-700 hover:border-violet-300",
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Login</p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="ts-email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="ts-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ts-password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="ts-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      </div>

      <Button
        className="h-10 w-full bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
        disabled={!canSubmit || isSubmitting}
        onClick={async () => {
          setIsSubmitting(true);
          try {
            await signup({
              email: email.trim(),
              name: name.trim(),
              role: "tester",
              password,
              testerSignup: {
                shortBio: shortBio.trim(),
                industries: [...industries],
              },
            });
            router.replace("/tester/feed");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {isSubmitting ? "Creating…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-700 hover:text-violet-900">
          Log in
        </Link>
      </p>
      <p className="text-center text-sm text-slate-500">
        Signing up as a founder?{" "}
        <Link href="/signup/founder" className="font-semibold text-violet-700 hover:text-violet-900">
          Join as founder
        </Link>
      </p>
    </div>
  );
}
