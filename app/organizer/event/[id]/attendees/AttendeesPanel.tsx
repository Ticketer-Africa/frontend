"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, ArrowRight01Icon, Loading03Icon, Search01Icon } from "@hugeicons/core-free-icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import { useListAttendees } from "@/services/attendees/attendees.queries";
import type { AttendeeStatus } from "@/services/attendees/attendees";

type FilterType = "ALL" | "TICKET";

const STATUS_VARIANT: Record<AttendeeStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30" },
  CHECKED_IN: { label: "Checked in", className: "bg-green-400/15 text-green-200 ring-1 ring-green-300/30" },
  ACTIVE: { label: "Active", className: "bg-[var(--home-accent)]/15 text-[var(--home-text-highlight)] ring-1 ring-[var(--home-accent)]/30" },
  USED: { label: "Used", className: "bg-white/10 text-[var(--home-muted)] ring-1 ring-white/10" },
};

interface AttendeesPanelProps {
  eventId: string;
}

export default function AttendeesPanel({ eventId }: AttendeesPanelProps) {
  const [type, setType] = useState<FilterType>("ALL");
  const [categoryId, setCategoryId] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const PAGE_SIZE = 20;

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [type, categoryId, debouncedSearch]);

  const { data: event } = useEventByIdV2(eventId);
  const { data, isLoading, isFetching } = useListAttendees(eventId, {
    type,
    q: debouncedSearch || undefined,
  });

  const allRows = useMemo(() => data?.attendees ?? [], [data]);
  const counts = data?.counts;

  const categoryOptions = useMemo(() => {
    const fromEvent =
      event?.ticketCategories?.map((c) => ({ id: c.id, name: c.name })) ?? [];
    if (fromEvent.length) return fromEvent;
    const seen = new Map<string, string>();
    for (const a of allRows) {
      if (a.ticketCategoryId && !seen.has(a.ticketCategoryId)) {
        seen.set(a.ticketCategoryId, a.ticketCategoryName || "Unnamed");
      }
    }
    return Array.from(seen, ([id, name]) => ({ id, name }));
  }, [event, allRows]);

  const filteredRows = useMemo(() => {
    if (categoryId === "ALL") return allRows;
    if (categoryId === "NONE")
      return allRows.filter((a) => !a.ticketCategoryId);
    return allRows.filter((a) => a.ticketCategoryId === categoryId);
  }, [allRows, categoryId]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const rows = useMemo(
    () =>
      filteredRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
      ),
    [filteredRows, currentPage],
  );

  const summary = useMemo(() => {
    if (!data) return null;
    return [
      { label: "Total", value: data.total },
      { label: "Ticket-holders", value: counts?.tickets ?? 0 },
    ];
  }, [data, counts]);

  return (
    <div className="flex flex-col gap-6">
      {summary && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {summary.map((s) => (
            <div
              key={s.label}
              className="border border-[var(--home-border)] bg-[var(--home-card-elevated)] rounded-xl p-4"
            >
              <p className="text-xs text-[var(--home-muted)]">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Tabs value={type} onValueChange={(v) => setType(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="TICKET">Ticket-holders</TabsTrigger>
          </TabsList>
        </Tabs>
        {categoryOptions.length > 0 && (
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All categories</SelectItem>
              <SelectItem value="NONE">No category</SelectItem>
              {categoryOptions.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="relative flex-1 max-w-sm">
          <HugeiconsIcon icon={Search01Icon} className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 border-[var(--home-border-strong)] bg-[var(--home-card-elevated)] text-[var(--home-text)] placeholder:text-[var(--home-muted-dim)] focus-visible:ring-[var(--home-accent)]"
            placeholder="Search name, email, phone, ticket code"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isFetching && !isLoading && (
          <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 animate-spin text-[var(--home-accent)]" />
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <HugeiconsIcon icon={Loading03Icon} className="h-8 w-8 animate-spin text-[var(--home-accent)]" />
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="text-center py-16 text-[var(--home-muted)]">
          No attendees match your filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category / Code</TableHead>
                <TableHead>Table</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => {
                const s = STATUS_VARIANT[a.status];
                return (
                  <TableRow key={`${a.type}-${a.id}`}>
                    <TableCell className="font-medium">
                      {a.name || <span className="text-[var(--home-muted)] italic">No name</span>}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>{a.email || "—"}</div>
                      {a.phone && (
                        <div className="text-[var(--home-muted)]">{a.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-block px-2 py-1 rounded text-xs ${s.className}`}>
                        {s.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        {a.ticketCategoryName || (
                          <span className="text-[var(--home-muted)]">—</span>
                        )}
                      </div>
                      {a.ticketCode && (
                        <div className="text-[var(--home-muted)] font-mono text-xs">
                          {a.ticketCode}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {a.tableNumber ? (
                        <span className="font-medium">{a.tableNumber}</span>
                      ) : (
                        <span className="text-[var(--home-muted)]">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {filteredRows.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-xs text-[var(--home-muted)]">
            Showing {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filteredRows.length)} of{" "}
            {filteredRows.length}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-1" />
                Prev
              </Button>
              <span className="text-sm text-[var(--home-muted)]">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Next
                <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
