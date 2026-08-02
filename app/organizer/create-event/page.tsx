"use client";

import { useAuthStatus } from "@/lib/auth-context";
import { EventWizard } from "../_components/event-wizard";
import { LoadingScreen } from "../_components/status-screens";

export default function CreateEventPage() {
  const { isLoading: authLoading } = useAuthStatus();

  if (authLoading) {
    return <LoadingScreen message="Loading..." subMessage="Verifying your session" />;
  }

  return <EventWizard mode="create" />;
}
