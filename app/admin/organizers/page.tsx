"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAdminOrganizers } from "@/services/admin/admin.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminOrganizersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: organizers = [], isLoading } = useAdminOrganizers();

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
        <CardHeader><CardTitle>Organizers</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {organizers.map((o: any) => (
            <div key={o.id} className="border rounded-md p-3">
              <div className="font-medium">{o.name || o.email}</div>
              <div className="text-xs text-muted-foreground">Events: {o.events?.length ?? 0}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


