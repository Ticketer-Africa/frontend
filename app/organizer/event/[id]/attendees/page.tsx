"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import AttendeesPanel from "./AttendeesPanel";

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { data: event } = useEventByIdV2(eventId);

  return (
    <div className="home-theme dark min-h-screen pt-16 bg-[var(--home-bg)] text-[var(--home-text)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Attendees</h1>
            <p className="text-sm text-[var(--home-muted)]">
              {event?.name ? `Managing attendees for ${event.name}` : "Manage everyone going to this event"}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full md:w-auto rounded-full border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] hover:bg-[var(--home-card)] hover:text-[var(--home-text)]">
            <Link href={`/organizer/view-event/${eventId}`}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
              Back to event
            </Link>
          </Button>
        </div>

        <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
          <CardHeader>
            <CardTitle>All attendees</CardTitle>
          </CardHeader>
          <CardContent>
            <AttendeesPanel eventId={eventId} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
