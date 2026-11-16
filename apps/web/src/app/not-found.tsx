import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-heading text-7xl font-semibold text-primary">404</p>
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground text-balance">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved.
        </p>
      </div>
      <Button asChild size="lg">
        <Link href="/">
          <ArrowLeft />
          Back home
        </Link>
      </Button>
    </div>
  );
}
