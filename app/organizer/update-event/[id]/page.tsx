"use client";

import { useParams } from "next/navigation";

import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import { useAuthStatus } from "@/lib/auth-context";
import { EventWizard } from "../../_components/event-wizard";
import { LoadingScreen, ErrorScreen } from "../../_components/status-screens";

export default function UpdateEventPage() {
  const { isLoading: authLoading } = useAuthStatus();
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { data: event, isLoading: eventLoading, error } = useEventByIdV2(eventId!);

  if (authLoading || eventLoading) {
    return <LoadingScreen message="Loading..." subMessage="Fetching event details" />;
  }
  if (error || !event) {
    return <ErrorScreen message="Failed to load event" />;
  }

  return <EventWizard mode="update" eventId={eventId} initialEvent={event} />;
}
