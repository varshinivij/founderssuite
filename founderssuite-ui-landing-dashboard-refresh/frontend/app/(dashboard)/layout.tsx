import { Suspense, type ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-6 h-6 rounded-full border-2 border-[#8b5cf6] border-t-transparent animate-spin" />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Suspense fallback={<PageLoader />}>{children}</Suspense>
    </DashboardShell>
  );
}

