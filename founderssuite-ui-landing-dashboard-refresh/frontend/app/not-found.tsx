import Link from "next/link";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-6 py-16">
      <Card className="bg-bg-accent border-divider shadow-card p-10 text-center max-w-lg w-full">
        <div className="text-2xl font-extrabold">404</div>
        <div className="mt-2 text-sm text-neutral-text-gray">
          That page doesn’t exist.
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-purple hover:bg-purple-mid"
            )}
          >
            Go home
          </Link>
        </div>
      </Card>
    </div>
  );
}

