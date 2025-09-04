"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useAdminTransactions } from "@/services/admin/admin.queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { data: transactions = [], isLoading } = useAdminTransactions();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) router.push(`/login?returnUrl=${encodeURIComponent(window.location.href)}`);
      else if (!["ADMIN", "SUPERADMIN"].includes(currentUser.role)) router.push("/explore");
    }
  }, [currentUser, authLoading, router]);

  const filtered = useMemo(() => {
    if (!search) return transactions;
    const q = search.toLowerCase();
    return transactions.filter((t: any) =>
      [t.reference, t.user?.email, t.event?.name].some((f: string) => f?.toLowerCase().includes(q))
    );
  }, [transactions, search]);

  if (authLoading || isLoading) return null;

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <Input placeholder="Search by ref, email, event" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Card>
        <CardHeader><CardTitle>All Transactions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {filtered.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{t.type} • ₦{Intl.NumberFormat().format(t.amount)} • {t.status}</div>
                <div className="text-xs text-muted-foreground">{t.reference} • {t.user?.email} • {t.event?.name}</div>
              </div>
              <div className="text-xs">{new Date(t.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


