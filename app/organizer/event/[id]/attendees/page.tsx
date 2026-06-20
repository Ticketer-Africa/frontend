"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  QrCode,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import { useListAttendees } from "@/services/attendees/attendees.queries";
import type { Attendee, AttendeeStatus } from "@/services/attendees/attendees";
import { useRegenerateToken } from "@/services/invites/invites.queries";
import { useUpdateInvite } from "@/services/invites/invites.queries";
import { useRemoveInvitee } from "@/services/invites/invites.queries";
import { getInviteQrDataUrl } from "@/services/invites/invites";
import { InviteCard } from "@/components/invite-card";

type FilterType = "ALL" | "INVITE" | "TICKET";

const STATUS_VARIANT: Record<AttendeeStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  CHECKED_IN: { label: "Checked in", className: "bg-green-100 text-green-800" },
  ACTIVE: { label: "Active", className: "bg-blue-100 text-blue-800" },
  USED: { label: "Used", className: "bg-gray-200 text-gray-700" },
};

export default function AttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;
  const { toast } = useToast();

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

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [type, categoryId, debouncedSearch]);

  const { data: event } = useEventByIdV2(eventId);
  const { data, isLoading, isFetching } = useListAttendees(eventId, {
    type,
    q: debouncedSearch || undefined,
  });

  const { mutate: regenerateToken, isPending: regenerating } =
    useRegenerateToken(eventId);

  const { mutate: updateInvite, isPending: updating } = useUpdateInvite(eventId);

  const { mutate: removeInvitee, isPending: removing } =
    useRemoveInvitee(eventId);

  // ── Remove confirmation state ────────────────────────────────────────────────
  const [removeFor, setRemoveFor] = useState<Attendee | null>(null);

  const confirmRemove = () => {
    if (!removeFor?.inviteId) return;
    const target = removeFor;
    const inviteId = removeFor.inviteId;
    removeInvitee(inviteId, {
      onSuccess: () => {
        toast({
          title: "Invitee removed",
          description: `${target.name || "Attendee"} has been removed.`,
        });
        setRemoveFor(null);
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to remove invitee.",
          variant: "destructive",
        });
      },
    });
  };

  // ── QR dialog state ──────────────────────────────────────────────────────────
  const [qrFor, setQrFor] = useState<Attendee | null>(null);
  const [qrBlobUrl, setQrBlobUrl] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const openQr = async (a: Attendee) => {
    if (a.type !== "INVITE" || !a.inviteId) return;
    setQrFor(a);
    setQrBlobUrl(null);
    setQrLoading(true);
    try {
      const dataUrl = await getInviteQrDataUrl(eventId, a.inviteId);
      setQrBlobUrl(dataUrl);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load QR code.",
        variant: "destructive",
      });
    } finally {
      setQrLoading(false);
    }
  };

  const closeQr = () => {
    setQrBlobUrl(null);
    setQrFor(null);
  };

  const downloadQr = async () => {
    if (!cardRef.current || !qrFor) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `invite-${(qrFor.name || "guest")
        .replace(/\s+/g, "-")
        .toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast({
        title: "Error",
        description: "Failed to download invite card.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const copyLink = async (link: string | null) => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast({ title: "Copied!", description: "Invite link copied." });
  };

  const handleRegenerate = (a: Attendee) => {
    if (a.type !== "INVITE" || !a.inviteId) return;
    regenerateToken(a.inviteId, {
      onSuccess: () => {
        toast({
          title: "Token regenerated",
          description: `New QR / link issued for ${a.name || a.email || "attendee"}. The old one no longer works.`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to regenerate invite token.",
          variant: "destructive",
        });
      },
    });
  };

  // ── Edit dialog state ────────────────────────────────────────────────────────
  const [editFor, setEditFor] = useState<Attendee | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    ticketCategoryId: "",
  });

  const openEdit = useCallback((a: Attendee) => {
    setEditFor(a);
    setEditForm({
      name: a.name ?? "",
      email: a.email ?? "",
      phone: a.phone ?? "",
      ticketCategoryId: a.ticketCategoryId ?? "",
    });
  }, []);

  const closeEdit = () => setEditFor(null);

  const handleEditSave = () => {
    if (!editFor?.inviteId) return;
    const payload: Record<string, string | null> = {};
    if (editForm.name !== (editFor.name ?? "")) payload.name = editForm.name;
    if (editForm.email !== (editFor.email ?? "")) payload.email = editForm.email;
    if (editForm.phone !== (editFor.phone ?? "")) payload.phone = editForm.phone;
    if (editForm.ticketCategoryId !== (editFor.ticketCategoryId ?? ""))
      payload.ticketCategoryId = editForm.ticketCategoryId || null;

    updateInvite(
      { inviteId: editFor.inviteId, payload },
      {
        onSuccess: () => {
          toast({ title: "Saved", description: "Invitee details updated." });
          closeEdit();
        },
        onError: (err) => {
          toast({ title: "Error", description: err.message, variant: "destructive" });
        },
      },
    );
  };

  // ── Table data ───────────────────────────────────────────────────────────────
  const allRows = useMemo(() => data?.attendees ?? [], [data]);
  const counts = data?.counts;

  // Categories present in the data (fallback when event categories aren't loaded).
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

  // Category filtering is applied client-side over the returned attendees.
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
      { label: "Invitees", value: counts?.invites ?? 0 },
      { label: "Ticket-holders", value: counts?.tickets ?? 0 },
    ];
  }, [data, counts]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Attendees</h1>
            <p className="text-sm text-muted-foreground">
              {event?.name ? `Managing attendees for ${event.name}` : "Manage everyone going to this event"}
            </p>
          </div>
          <Button asChild variant="outline" className="w-full md:w-auto rounded-full">
            <Link href={`/organizer/view-event/${eventId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to event
            </Link>
          </Button>
        </div>

        {summary && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
            {summary.map((s) => (
              <Card key={s.label}>
                <CardContent className="py-4">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader className="gap-4">
            <CardTitle>All attendees</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Tabs value={type} onValueChange={(v) => setType(v as FilterType)}>
                <TabsList>
                  <TabsTrigger value="ALL">All</TabsTrigger>
                  <TabsTrigger value="INVITE">Invitees</TabsTrigger>
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
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search name, email, phone, ticket code"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              {isFetching && !isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#1E88E5]" />
              </div>
            ) : filteredRows.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                No attendees match your filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Category / Code</TableHead>
                      <TableHead>Admits</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((a) => {
                      const s = STATUS_VARIANT[a.status];
                      return (
                        <TableRow key={`${a.type}-${a.id}`}>
                          <TableCell className="font-medium">
                            {a.name || <span className="text-muted-foreground italic">No name</span>}
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>{a.email || "—"}</div>
                            {a.phone && (
                              <div className="text-muted-foreground">{a.phone}</div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {a.type === "INVITE" ? "Invite" : "Ticket"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded text-xs ${s.className}`}>
                              {s.label}
                            </span>
                          </TableCell>
                          <TableCell className="text-sm">
                            <div>
                              {a.ticketCategoryName || (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                            {a.type === "TICKET" && a.ticketCode && (
                              <div className="text-muted-foreground font-mono text-xs">
                                {a.ticketCode}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {a.type === "INVITE" ? (a.admitsCount ?? 1) : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right">
                            {a.type === "INVITE" ? (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">
                                      Open actions menu
                                    </span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => openQr(a)}>
                                    <QrCode className="h-4 w-4 mr-2" />
                                    View QR
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => copyLink(a.inviteLink)}
                                    disabled={!a.inviteLink}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy link
                                  </DropdownMenuItem>
                                  {a.status !== "CHECKED_IN" && (
                                    <DropdownMenuItem onClick={() => openEdit(a)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleRegenerate(a)}
                                    disabled={regenerating}
                                  >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Regenerate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600"
                                    onClick={() => setRemoveFor(a)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
                <p className="text-xs text-muted-foreground">
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
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Prev
                    </Button>
                    <span className="text-sm text-muted-foreground">
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
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* QR dialog */}
      <Dialog open={!!qrFor} onOpenChange={(open) => !open && closeQr()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite card</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-2 min-h-[360px]">
            {qrLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#1E88E5]" />
            ) : qrBlobUrl && qrFor ? (
              <InviteCard
                ref={cardRef}
                eventName={event?.name}
                eventDate={event?.date}
                eventLocation={event?.location}
                inviteeName={qrFor.name}
                admitsCount={qrFor.admitsCount}
                categoryName={qrFor.ticketCategoryName}
                qrUrl={qrBlobUrl}
              />
            ) : (
              <p className="text-muted-foreground text-sm">No QR available.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeQr}>
              Close
            </Button>
            <Button onClick={downloadQr} disabled={!qrBlobUrl || downloading}>
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editFor} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit invitee</DialogTitle>
            <DialogDescription>
              Changes take effect immediately. You cannot edit after check-in.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Guest name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="guest@example.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+2348012345678"
              />
            </div>
            {(event?.ticketCategories?.length ?? 0) > 0 && (
              <div className="grid gap-1.5">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editForm.ticketCategoryId || "none"}
                  onValueChange={(v) =>
                    setEditForm((f) => ({
                      ...f,
                      ticketCategoryId: v === "none" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="No category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No category</SelectItem>
                    {event?.ticketCategories?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEdit} disabled={updating}>
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={updating}>
              {updating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove confirmation */}
      <AlertDialog
        open={!!removeFor}
        onOpenChange={(open) => !open && !removing && setRemoveFor(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this invitee?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeFor?.name || "This attendee"} will be removed and their
              invite link / QR code will stop working. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmRemove();
              }}
              disabled={removing}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {removing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
