"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import { useDeleteEvent } from "@/services/events/events.queries";
import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import { EventV2 } from "@/types/events-v2.type";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Calendar01Icon, ChartBarLineIcon, ChartUpIcon, Copy01Icon, Delete02Icon, Loading03Icon, MoreVerticalIcon, PencilEdit02Icon, Tick01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/helpers";
import EventManagementTabs from "./EventManagementTabs";

export default function EventDashboard() {
  const { user: currentUser } = useUser();
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Extract id from dynamic route
  const { data: event, isLoading: eventsLoading } = useEventByIdV2(id as string);
  const { mutate: deleteEvent } = useDeleteEvent();
  const { toast } = useToast();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  if (eventsLoading) {
    return (
      <div className="home-theme min-h-screen flex items-center justify-center bg-[var(--home-bg)] text-[var(--home-text)]">
        <div className="text-center">
          <HugeiconsIcon icon={Loading03Icon} className="h-12 w-12 animate-spin text-[var(--home-accent)] mx-auto mb-4" />
          <p className="text-lg text-[var(--home-muted)]">
            Loading event details...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="home-theme min-h-screen bg-[var(--home-bg)] text-[var(--home-text)] text-center py-8">
        Event not found
      </div>
    );
  }

  const handleDeleteClick = (eventId: string) => {
    setDeleteEventId(eventId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteEventId) {
      deleteEvent(deleteEventId, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setDeleteEventId(null);
          router.push("/organizer"); // Redirect to general dashboard after delete
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

  const handleCopyEventUrl = async () => {
    const eventUrl = `${window.location.origin}/events/${event.slug}`;
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopiedToClipboard(true);
      toast({
        title: "Copied!",
        description: "Event URL copied to clipboard",
      });
      setTimeout(() => setCopiedToClipboard(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const totalTickets: number =
    event?.ticketCategories?.reduce(
      (sum, cat) => sum + (cat.maxTickets || 0),
      0,
    ) ?? 0;

  const ticketsSold: number =
    event?.ticketCategories?.reduce((sum, cat) => sum + (cat.minted || 0), 0) ??
    0;

  const totalRevenue: number =
    event?.ticketCategories?.reduce(
      (sum, cat) => sum + (cat.minted || 0) * (cat.price || 0),
      0,
    ) ?? 0;
  const percentageSold =
    totalTickets > 0 ? Math.round((ticketsSold / totalTickets) * 100) : 0;

  return (
    <div className="home-theme dark min-h-screen pt-16 bg-[var(--home-bg)] text-[var(--home-text)]">
      <div className="container mx-auto px-4 py-8">
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{event.name}</h1>
              <p className="text-sm sm:text-base text-[var(--home-muted)]">
                Welcome back, {currentUser && currentUser.name}! Managing{" "}
                {event.name}
              </p>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto border-0 bg-[var(--home-accent)] hover:bg-[#f18b76] text-[var(--home-accent-fg)] rounded-full px-6 py-2 shadow-none transition-[background-color,color,border-color,opacity,transform] duration-150 active:translate-y-px"
            >
              <Link href="/organizer">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Tickets
                  </CardTitle>
                  <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalTickets}
                  </div>
                  <p className="text-xs text-[var(--home-muted)]">
                    Available tickets
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tickets Sold
                  </CardTitle>
                  <HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {ticketsSold}
                  </div>
                  <p className="text-xs text-[var(--home-muted)]">
                    Out of {totalTickets}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Percentage Sold
                  </CardTitle>
                  <HugeiconsIcon icon={ChartUpIcon} className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {percentageSold}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Net Earnings
                  </CardTitle>
                  <HugeiconsIcon icon={ChartBarLineIcon} className="h-4 w-4 text-[var(--home-accent)]" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatPrice(Math.round(totalRevenue))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Event Details */}
          <div>
            <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border border-[var(--home-border)] bg-[var(--home-card-elevated)] rounded-2xl">
                  <img
                    src={event.bannerUrl || "/placeholder.svg"}
                    alt={event.name}
                    className="w-32 h-32 rounded-xl object-cover ring-1 ring-[var(--home-border)]"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                      <h3 className="font-semibold text-base sm:text-lg">
                        {event.name}
                      </h3>
                    </div>
                    <p className="text-sm sm:text-base text-[var(--home-muted)] mb-2">
                      {new Date(event.date).toLocaleDateString()} •{" "}
                      {event.venueName}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm">
                      <span className="text-[var(--home-muted)]">
                        {ticketsSold}/{totalTickets} sold
                      </span>
                      <span className="text-[var(--home-success-text)] font-medium">
                        {formatPrice(totalRevenue)} revenue
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="right"
                        className="bg-[var(--home-card-highlight)] text-[var(--home-text)] shadow-lg rounded-xl border border-[var(--home-border)] mt-2 z-50"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/organizer/update-event/${event.id}`)
                          }
                          className="text-sm text-[var(--home-text)] hover:bg-[var(--home-card)] rounded-lg p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
                        >
                          <HugeiconsIcon icon={PencilEdit02Icon} className="mr-2 h-4 w-4" /> Update Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[var(--home-border)] h-px my-1" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(event.id)}
                          className="text-sm text-white bg-red-700 hover:bg-red-600 rounded-lg p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="mr-2 h-4 w-4" /> Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="w-full sm:w-32 bg-[var(--home-border-strong)] rounded-full h-2 mt-2">
                      <div
                        className="bg-[var(--home-accent)] h-2 rounded-full"
                        style={{
                          width: `${percentageSold}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-[var(--home-muted)] mt-1 text-right">
                      {percentageSold}% sold
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] hover:bg-[var(--home-card-highlight)] hover:text-[var(--home-text)]">
                    <Link href={`/organizer/event/${event.id}/attendees`}>
                      View Attendees
                    </Link>
                  </Button>
                </div>

                {/* Event URL Section */}
                <div className="mt-6 pt-6 border-t border-[var(--home-border)]">
                  <p className="text-sm font-medium mb-3">Event URL</p>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm break-all bg-[var(--home-card-elevated)] text-[var(--home-muted)] px-3 py-2 rounded-xl font-mono">
                      {`${typeof window !== "undefined" ? window.location.origin : ""}/events/${event.slug}`}
                    </p>
                    <Button
                      onClick={handleCopyEventUrl}
                      variant="default"
                      size="sm"
                      className="w-full sm:w-auto border-0 bg-[var(--home-accent)] text-[var(--home-accent-fg)] hover:bg-[#f18b76]"
                    >
                      {copiedToClipboard ? (
                        <>
                          <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                          Copy URL
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Optional Analytics Placeholder */}
          <div
            className="mt-8"
          >
            <Card className="border-[var(--home-border)] bg-[var(--home-card)] text-[var(--home-text)] shadow-none">
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[var(--home-muted)]">
                  Sales trends and insights coming soon.
                </p>
              </CardContent>
            </Card>
          </div>

          <div
            className="mt-8"
          >
            <EventManagementTabs eventId={event.id} />
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
