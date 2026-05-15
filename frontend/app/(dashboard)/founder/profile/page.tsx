"use client";

import { useState } from "react";
import { mockFounderProfile } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function FounderProfilePage() {
  const [profile, setProfile] = useState(mockFounderProfile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">Founder profile</h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-600">
          Configure what testers see and what you&apos;re looking for.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-slate-700">
              Company name
            </Label>
            <Input
              id="companyName"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDemoUrl" className="text-slate-700">
              Product demo URL
            </Label>
            <Input
              id="productDemoUrl"
              value={profile.productDemoUrl ?? ""}
              onChange={(e) => setProfile({ ...profile, productDemoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyDescription" className="text-slate-700">
              Description
            </Label>
            <textarea
              id="companyDescription"
              value={profile.companyDescription}
              onChange={(e) => setProfile({ ...profile, companyDescription: e.target.value })}
              rows={3}
              className={cn(
                "min-h-[88px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lookingFor" className="text-slate-700">
              What you&apos;re looking for
            </Label>
            <textarea
              id="lookingFor"
              value={profile.lookingFor}
              onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
              rows={3}
              className={cn(
                "min-h-[88px] w-full resize-y rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm outline-none",
                "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              )}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <Button type="button" className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed]">
            Save (mock)
          </Button>
        </div>
      </div>
    </div>
  );
}
