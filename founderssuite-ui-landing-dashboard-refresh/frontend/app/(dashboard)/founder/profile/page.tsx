"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function FounderProfilePage() {
  const { user } = useAuth();

  const [companyName, setCompanyName] = useState("FoundersSuite");
  const [companyDescription, setCompanyDescription] = useState(
    "A two-sided marketplace connecting founders with domain-matched testers for validation interviews and surveys."
  );
  const [lookingFor, setLookingFor] = useState(
    "Experienced operators who have lived the pain and can give direct, actionable feedback."
  );
  const [productDemoUrl, setProductDemoUrl] = useState("https://example.com/demo");
  const [isSaving, setIsSaving] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#0a0a0f]">
          Founder profile
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Configure what testers see and what you're looking for.
        </p>
      </div>

      {/* Identity card */}
      <div className="rounded-3xl bg-white border border-black/10 p-6 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-[#3d1454] text-white flex items-center justify-center text-xl font-extrabold">
            {(user?.name?.[0] ?? "F").toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-extrabold text-[#0a0a0f]">{user?.name ?? "Founder"}</div>
            <div className="text-sm text-[#6b7280]">{user?.email ?? ""}</div>
            <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-[#ede9fe] border border-[#8b5cf6]/20 px-3 py-0.5 text-xs font-semibold text-[#3d1454]">
              Founder
            </div>
          </div>
        </div>
      </div>

      {/* Company details */}
      <div className="bg-white border border-black/10 rounded-2xl p-6 space-y-5 shadow-[0_12px_32px_rgba(0,0,0,0.06)]">
        <div className="text-sm font-extrabold text-[#0a0a0f]">Company details</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-[#0a0a0f] font-semibold">Company name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDemoUrl" className="text-[#0a0a0f] font-semibold">Product demo URL</Label>
            <Input
              id="productDemoUrl"
              value={productDemoUrl}
              onChange={(e) => setProductDemoUrl(e.target.value)}
              placeholder="https://…"
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyDescription" className="text-[#0a0a0f] font-semibold">Description</Label>
            <Input
              id="companyDescription"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lookingFor" className="text-[#0a0a0f] font-semibold">What you're looking for</Label>
            <Input
              id="lookingFor"
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              className="border-black/10 bg-white text-[#0a0a0f]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            className="bg-[#8b5cf6] text-white hover:bg-[#7c3aed]"
            disabled={isSaving}
            onClick={async () => {
              setIsSaving(true);
              await new Promise((r) => setTimeout(r, 600));
              setIsSaving(false);
              toast.success("Profile saved");
            }}
          >
            {isSaving ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
    </div>
  );
}
