"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@/lib/auth-context";
import { useEventBySlugV2 } from "@/services/events/events-v2.queries";
import { toViewModelFromApiEvent } from "@/lib/event-layout-adapter";
import { LAYOUT_COMPONENTS } from "@/app/events/_shared/layouts/registry";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon } from "@hugeicons/core-free-icons";

export default function EventPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  useUser();
  const { data: event, isLoading, error } = useEventBySlugV2(params.slug);

  if (isLoading) return <LoadingSkeleton />;
  if (error || !event) return <NotFound router={router} />;

  const viewModel = toViewModelFromApiEvent(event);
  const LayoutComponent = LAYOUT_COMPONENTS[viewModel.layout];

  return <LayoutComponent event={viewModel} mode="live" />;
}

function LoadingSkeleton() {
  return (
    <div className="home-theme min-h-screen pt-16" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="container mx-auto px-4 py-8">
        <Skeleton
          className="h-72 w-full rounded-2xl mb-10"
          style={{ backgroundColor: "var(--home-card-elevated)" }}
        />
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-10">
            <Skeleton className="h-10 w-3/4" style={{ backgroundColor: "var(--home-card-elevated)" }} />
            <Skeleton className="h-48 w-full" style={{ backgroundColor: "var(--home-card-elevated)" }} />
            <Skeleton className="h-48 w-full" style={{ backgroundColor: "var(--home-card-elevated)" }} />
          </div>
          <Skeleton
            className="lg:col-span-4 h-[600px] rounded-2xl"
            style={{ backgroundColor: "var(--home-card-elevated)" }}
          />
        </div>
      </div>
    </div>
  );
}

function NotFound({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <div className="home-theme min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--home-bg)" }}>
      <div className="max-w-md text-center">
        <HugeiconsIcon icon={Alert01Icon} className="mx-auto h-16 w-16" style={{ color: "var(--home-muted)" }} />
        <h2 className="mt-6 text-2xl font-bold" style={{ color: "var(--home-text)" }}>Event not found</h2>
        <p className="mt-3" style={{ color: "var(--home-muted)" }}>
          The event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button variant="homeAccent" className="mt-8 w-full" onClick={() => router.push("/explore")}>
          Discover Events
        </Button>
      </div>
    </div>
  );
}
