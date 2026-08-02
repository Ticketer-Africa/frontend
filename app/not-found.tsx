import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";

export default function NotFound() {
  return (
    <div
      className="home-theme dark min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-md text-center">
        <HugeiconsIcon icon={Alert01Icon} className="mx-auto h-16 w-16" style={{ color: "var(--home-muted)" }} />
        <h2 className="mt-6 text-2xl font-bold" style={{ color: "var(--home-text)" }}>
          Page not found
        </h2>
        <p className="mt-3" style={{ color: "var(--home-muted)" }}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <Button variant="homeAccent" className="mt-8 w-full" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}
