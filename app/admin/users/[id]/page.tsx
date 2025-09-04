"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useAdminUserDetails } from "@/services/admin/admin.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUserDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: user, isLoading } = useAdminUserDetails(userId);

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) router.push(`/login?returnUrl=${encodeURIComponent(window.location.href)}`);
      else if (!["ADMIN", "SUPERADMIN"].includes(currentUser.role)) router.push("/explore");
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || isLoading) return null;
  if (!user) return <div className="container mx-auto px-4 py-8">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Card>
        <CardHeader><CardTitle>{user.name || user.email}</CardTitle></CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">{user.email} • {user.role}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(user.tickets ?? []).map((t: any) => (
            <div key={t.id} className="border rounded-md p-3">
              <div className="font-medium">{t.event?.name}</div>
              <div className="text-xs text-muted-foreground">Category: {t.ticketCategory?.name || '—'}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(user.transactions ?? []).map((tx: any) => (
            <div key={tx.id} className="border rounded-md p-3">
              <div className="font-medium">{tx.type} • ₦{Intl.NumberFormat().format(tx.amount)}</div>
              <div className="text-xs text-muted-foreground">{tx.event?.name} • {new Date(tx.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


