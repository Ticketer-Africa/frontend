"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";
import { useDeleteEvent } from "@/services/events/events.queries";
import { useEventByIdV2 } from "@/services/events/events-v2.queries";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Delete02Icon, Loading03Icon, MoreVerticalIcon, PencilEdit02Icon } from "@hugeicons/core-free-icons";
import {
  EVENT_STATUS_BADGE_CLASS,
  EVENT_STATUS_LABEL,
  getEventStatus,
} from "@/lib/event-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import EventManagementTabs from "./EventManagementTabs";

export default function EventDashboard() {
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Extract id from dynamic route
  const { data: event, isLoading: eventsLoading } = useEventByIdV2(id as string);
  const { mutate: deleteEvent } = useDeleteEvent();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

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

  const status = getEventStatus(event);

  return (
    <div className="home-theme dark min-h-screen pt-16 bg-[var(--home-bg)] text-[var(--home-text)]">
      <div className="container mx-auto px-4 py-8">
        <div>
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-7 gap-4">
            <div className="flex items-center gap-5">
              <div
                className="w-[72px] h-[72px] rounded-2xl bg-cover bg-center shrink-0 ring-1 ring-[var(--home-border)]"
                style={{ backgroundImage: `url(${event.bannerUrl || "/placeholder.svg"})` }}
              />
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold">{event.name}</h1>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${EVENT_STATUS_BADGE_CLASS[status]}`}
                  >
                    {EVENT_STATUS_LABEL[status]}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
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
                </div>
                <span className="text-sm text-[var(--home-muted)]">
                  {new Date(event.date).toLocaleDateString()} · {event.venueName}
                </span>
              </div>
            </div>
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto border-[var(--home-border-strong)] bg-transparent text-[var(--home-text)] rounded-full px-6 py-2 shadow-none hover:bg-[var(--home-card)]"
            >
              <Link href="/organizer">
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          <EventManagementTabs event={event} />
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
