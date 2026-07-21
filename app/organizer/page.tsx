"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Users,
  BarChart3,
  Trash2,
  MoreVertical,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/helpers";
import { getEventTicketStats } from "@/lib/event-stats";
import { useUser } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useDeleteEvent } from "@/services/events/events.queries";
import { useOrganizerEventsV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";

const EventRow = memo(function EventRow({
  event,
  index,
  onNavigate,
  onEdit,
  onDeleteClick,
}: {
  event: EventV2;
  index: number;
  onNavigate: (eventId: string) => void;
  onEdit: (eventId: string) => void;
  onDeleteClick: (eventId: string) => void;
}) {
  const stats = useMemo(
    () => getEventTicketStats(event.ticketCategories),
    [event.ticketCategories],
  );

  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-[var(--home-border)] bg-[var(--home-card-elevated)] rounded-2xl hover:bg-[var(--home-card-highlight)] transition-colors cursor-pointer"
      onClick={() => onNavigate(event.id)}
    >
      <img
        src={event.bannerUrl || "/placeholder.svg"}
        alt={event.name}
        className="w-16 h-16 rounded-xl object-cover ring-1 ring-[var(--home-border)]"
      />
      <div className="flex-1 w-full sm:w-auto">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
          <h3 className="font-semibold text-sm sm:text-base">{event.name}</h3>
        </div>
        <p className="text-xs sm:text-sm text-[var(--home-muted)] mb-1 sm:mb-2">
          {new Date(event.date).toLocaleDateString()} • {event.location}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
          <span className="text-[var(--home-muted)]">
            {stats.sold}/{stats.total} sold
          </span>
          <span className="text-[var(--home-success-text)] font-medium">
            {formatPrice(stats.revenue).toLocaleString()} revenue
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="right"
            className="bg-[var(--home-card-highlight)] text-[var(--home-text)] shadow-lg rounded-xl border border-[var(--home-border)] mt-2 z-50"
          >
            <DropdownMenuItem
              onClick={() => onEdit(event.id)}
              className="text-sm text-[var(--home-text)] hover:bg-[var(--home-card)] rounded-lg p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" /> Update Event
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[var(--home-border)] h-px my-1" />
            <DropdownMenuItem
              onClick={() => onDeleteClick(event.id)}
              className="text-sm text-white bg-red-700 hover:bg-red-600 rounded-lg p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete Event
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="w-full sm:w-24 bg-[var(--home-border-strong)] rounded-full h-2 mt-2">
          <div
            className="bg-[var(--home-accent)] h-2 rounded-full"
            style={{ width: `${stats.percentSold}%` }}
          />
        </div>
        <p className="text-xs sm:text-sm text-[var(--home-muted)] mt-1 text-right">
          {stats.percentSold}% sold
        </p>
      </div>
    </div>
  );
});

export default function OrganizerDashboard() {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const { data: organizerEventList, isLoading: eventsLoading } =
    useOrganizerEventsV2();
  const { mutate: deleteEvent } = useDeleteEvent();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  // Handle both array and paginated response formats
  const organizerEvents: EventV2[] = Array.isArray(organizerEventList)
    ? organizerEventList
    : organizerEventList?.data ?? [];

  const dashboardStats = useMemo(() => {
    let totalTicketsSold = 0;
    let totalRevenue = 0;
    for (const event of organizerEvents) {
      const stats = getEventTicketStats(event.ticketCategories);
      totalTicketsSold += stats.sold;
      totalRevenue += stats.revenue;
    }
    return {
      totalEvents: organizerEvents.length,
      totalTicketsSold,
      totalRevenue,
    };
  }, [organizerEvents]);

  const handleNavigate = useCallback(
    (eventId: string) => router.push(`/organizer/view-event/${eventId}`),
    [router],
  );

  const handleEdit = useCallback(
    (eventId: string) => router.push(`/organizer/update-event/${eventId}`),
    [router],
  );

  const handleDeleteClick = useCallback((eventId: string) => {
    setDeleteEventId(eventId);
    setIsDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (deleteEventId) {
      deleteEvent(deleteEventId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteEventId(null);
        },
        onError: (error) => {
          console.error("Failed to delete event:", error);
          setIsDeleteDialogOpen(false);
        },
      });
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setDeleteEventId(null);
  };

  if (eventsLoading) {
    return (
      <div className="home-theme min-h-screen flex items-center justify-center bg-[var(--home-bg)] text-[var(--home-text)]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[var(--home-accent)] mx-auto mb-4" />
          <p className="text-lg text-[var(--home-muted)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-theme dark min-h-screen pt-16 bg-[var(--home-bg)] text-[var(--home-text)]">
      <div className="container mx-auto px-4 py-8">
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-[var(--home-muted)]">
                Welcome back, {currentUser && currentUser.name}!
              </p>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto border-0 bg-[var(--home-accent)] hover:bg-[#f18b76] text-[var(--home-accent-fg)] rounded-full px-6 py-2 shadow-none transition-[background-color,color,border-color,opacity,transform] duration-150 active:translate-y-px"
            >
              <Link href="/organizer/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {dashboardStats.totalEvents}
                  </div>
                  <p className="text-xs text-[var(--home-muted)]">Active events</p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tickets Sold
                  </CardTitle>
                  <Users className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {dashboardStats.totalTicketsSold}
                  </div>
                  <p className="text-xs text-[var(--home-muted)]">
                    Across all events
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Net Earnings
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatPrice(Math.round(dashboardStats.totalRevenue))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Events List */}
          <div>
            <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Your Events</CardTitle>
              </CardHeader>
              <CardContent>
                {organizerEvents.length > 0 ? (
                  <div className="space-y-4">
                    {organizerEvents.map((event: EventV2, index: number) => (
                      <EventRow
                        key={event.id}
                        event={event}
                        index={index}
                        onNavigate={handleNavigate}
                        onEdit={handleEdit}
                        onDeleteClick={handleDeleteClick}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-[var(--home-accent)] mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No events yet</h3>
                    <p className="text-[var(--home-muted)] mb-4">
                      Create your first event to start selling tickets and
                      managing attendees.
                    </p>
                    <Button asChild className="border-0 bg-[var(--home-accent)] text-[var(--home-accent-fg)] hover:bg-[#f18b76]">
                      <Link href="/organizer/create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      {/* Global Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
        <DialogContent className="sm:max-w-[425px] bg-[var(--home-card)] text-[var(--home-text)] p-6 sm:p-8 rounded-2xl shadow-2xl border border-[var(--home-border)] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-center font-semibold text-[var(--home-text)]">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-[var(--home-muted)]">
              Are you sure you want to delete this event?
              <span className="block mt-2 text-red-300 font-medium">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-4 sm:gap-32 mt-4">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="w-full sm:w-auto rounded-xl border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] hover:bg-[var(--home-card-highlight)]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto rounded-xl border-red-800 bg-red-700 text-white hover:bg-red-600"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
