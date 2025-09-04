"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAdminEvents, useAdminToggleEvent } from "@/services/admin/admin.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminEventsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: events = [], isLoading } = useAdminEvents();
  const { mutate: toggle, isPending } = useAdminToggleEvent();

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) router.push(`/login?returnUrl=${encodeURIComponent(window.location.href)}`);
      else if (!["ADMIN", "SUPERADMIN"].includes(currentUser.role)) router.push("/explore");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || isLoading) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader><CardTitle>Events</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {events.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{e.name}</div>
                <div className="text-xs text-muted-foreground">Organizer: {e.organizer?.name || e.organizer?.email}</div>
              </div>
              <Button size="sm" disabled={isPending} onClick={() => toggle(e.id)} className={e.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}>
                {e.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


