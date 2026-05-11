"use client";

import { useState } from "react";
import { mockFounderProfile } from "@/lib/mock-data";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FounderProfilePage() {
  const [profile, setProfile] = useState(mockFounderProfile);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Founder profile
        </h1>
        <p className="mt-1 text-sm text-neutral-text-gray">
          Configure what testers see and what you’re looking for.
        </p>
      </div>

      <Card className="bg-bg-accent border-divider shadow-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={profile.companyName}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="productDemoUrl">Product demo URL</Label>
            <Input
              id="productDemoUrl"
              value={profile.productDemoUrl ?? ""}
              onChange={(e) => setProfile({ ...profile, productDemoUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="companyDescription">Description</Label>
            <Input
              id="companyDescription"
              value={profile.companyDescription}
              onChange={(e) =>
                setProfile({ ...profile, companyDescription: e.target.value })
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="lookingFor">What you’re looking for</Label>
            <Input
              id="lookingFor"
              value={profile.lookingFor}
              onChange={(e) => setProfile({ ...profile, lookingFor: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button className="bg-purple hover:bg-purple-mid">Save (mock)</Button>
        </div>
      </Card>
    </div>
  );
}

