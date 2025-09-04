"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAdminUsers } from "@/services/admin/admin.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: users = [], isLoading } = useAdminUsers();

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
        <CardHeader><CardTitle>Users</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {users.map((u: any) => (
              <Link key={u.id} href={`/admin/users/${u.id}`} className="block border rounded-md p-3 hover:bg-muted">
                <div className="font-medium">{u.name || u.email}</div>
                <div className="text-xs text-muted-foreground">{u.email} • {u.role}</div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


