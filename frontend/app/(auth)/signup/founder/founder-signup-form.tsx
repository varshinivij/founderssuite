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

export function FounderSignupForm() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState<string>(INDUSTRY_OPTIONS[0]);
  const [location, setLocation] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [socialUrl, setSocialUrl] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 0 &&
      company.trim().length > 0 &&
      industry.length > 0 &&
      location.trim().length > 0 &&
      shortBio.trim().length > 0 &&
      email.trim().length > 0 &&
      password.length >= 4
    );
  }, [name, company, industry, location, shortBio, email, password]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Founders</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h2>
        <p className="mt-1 text-sm text-slate-600">Tell us about you and your company, then set your login.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fs-name" className="text-slate-700">
            Name
          </Label>
          <Input id="fs-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fs-company" className="text-slate-700">
            Company
          </Label>
          <Input
            id="fs-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Company or product name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fs-industry" className="text-slate-700">
            Industry
          </Label>
          <select
            id="fs-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={cn(
              "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          >
            {INDUSTRY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fs-location" className="text-slate-700">
            Location
          </Label>
          <Input
            id="fs-location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, region, or remote"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fs-bio" className="text-slate-700">
            Short bio
          </Label>
          <textarea
            id="fs-bio"
            value={shortBio}
            onChange={(e) => setShortBio(e.target.value)}
            placeholder="One or two sentences on what you're building and who you want feedback from."
            rows={3}
            className={cn(
              "min-h-[88px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fs-social" className="text-slate-700">
            LinkedIn or X URL
          </Label>
          <Input
            id="fs-social"
            value={socialUrl}
            onChange={(e) => setSocialUrl(e.target.value)}
            placeholder="https://linkedin.com/in/… or https://x.com/…"
          />
        </div>

        <div className="border-t border-slate-200 pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Login</p>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="fs-email" className="text-slate-700">
                Email
              </Label>
              <Input
                id="fs-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fs-password" className="text-slate-700">
                Password
              </Label>
              <Input
                id="fs-password"
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
              role: "founder",
              password,
              founderSignup: {
                company: company.trim(),
                industry,
                location: location.trim(),
                shortBio: shortBio.trim(),
                socialUrl: socialUrl.trim(),
              },
            });
            router.replace("/founder/dashboard");
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
        Signing up as a tester?{" "}
        <Link href="/signup/tester" className="font-semibold text-violet-700 hover:text-violet-900">
          Join as tester
        </Link>
      </p>
    </div>
  );
}
