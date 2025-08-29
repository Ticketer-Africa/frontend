"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Trash2,
  MoreVertical,
  Edit,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/lib/dummy-data";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
import {
  useDeleteEvent,
  useOrganizerEvents,
} from "@/services/events/events.queries";
import { useEffect, useState } from "react";
import { Event } from "@/types/events.type";
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
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { formatPrice } from "@/lib/dummy-data";

export default function EventDashboard() {
  const { isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { id } = params; // Extract id from dynamic route
  const { data: organizerEventList, isLoading: eventsLoading } = useOrganizerEvents();
  const { mutate: deleteEvent } = useDeleteEvent();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser && !authLoading) {
      router.push(
        `/login?returnUrl=${encodeURIComponent(window.location.href)}`
      );
      return;
    }
    if (currentUser && !["ORGANIZER"].includes(currentUser.role)) {
      router.push("/explore");
      return;
    }
  }, [currentUser, authLoading, router]);

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1E88E5] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

const organizerEvents = Array.isArray(organizerEventList)
  ? organizerEventList.filter(
      (event) => currentUser && event.organizerId === currentUser.id
    )
  : [];


  const event: Event = organizerEvents.find((e: Event) => e.id === id);
  console.log(event)
 

  if (!event) {
    return <div className="min-h-screen bg-background text-center py-8">Event not found</div>;
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

  const totalTickets: number = event?.ticketCategories?.reduce(
  (sum, cat) => sum + (cat.maxTickets || 0),
  0
) ?? 0;

const ticketsSold: number = event?.ticketCategories?.reduce(
  (sum, cat) => sum + (cat.minted || 0),
  0
) ?? 0;

const totalRevenue: number = event?.ticketCategories?.reduce(
  (sum, cat) => sum + (cat.minted || 0) * (cat.price || 0),
  0
) ?? 0;
const percentageSold = totalTickets > 0 
  ? Math.round((ticketsSold / totalTickets) * 100) 
  : 0;
  

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{event.name}</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, {currentUser && currentUser.name}! Managing {event.name}
              </p>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/organizer">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Total Tickets
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalTickets}
                  </div>
                  <p className="text-xs text-muted-foreground">Available tickets</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Tickets Sold
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{ticketsSold}</div>
                  <p className="text-xs text-muted-foreground">
                    Out of {totalTickets}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Percentage Sold
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">{percentageSold}%</div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium">
                    Net Earnings
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {formatPrice(Math.round(totalRevenue))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Event Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Event Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg">
                  <img
                    src={event.bannerUrl || "/placeholder.svg"}
                    alt={event.name}
                    className="w-32 h-32 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                      <h3 className="font-semibold text-base sm:text-lg">{event.name}</h3>
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground mb-2">
                      {new Date(event.date).toLocaleDateString()} • {event.location}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-sm">
                      <span className="text-muted-foreground">
                        {ticketsSold}/{totalTickets} sold
                      </span>
                      <span className="text-green-600 font-medium">
                        {formatPrice(totalRevenue)} revenue
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="right"
                        className="bg-white shadow-lg rounded-md border border-gray-200 mt-2"
                      >
                        <DropdownMenuItem
                          onClick={() => router.push(`/organizer/update-event/${event.id}`)}
                          className="text-sm text-gray-700 hover:bg-gray-100 rounded-md p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Update Event
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200 h-px my-1" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(event.id)}
                          className="text-sm text-white bg-red-600 hover:bg-red-400 rounded-md p-2 transition-colors focus:outline-none flex items-center cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="w-full sm:w-32 bg-muted rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-blue-600 to-pink-600 h-2 rounded-full"
                        style={{
                          width: `${percentageSold}%`,
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 text-right">
                      {percentageSold}% sold
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline">
                    <Link href={`/organizer/event/${event.id}/attendees`}>
                      View Attendees
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Optional Analytics Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Sales trends and insights coming soon.</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      {/* Global Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogOverlay className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />
        <DialogContent className="sm:max-w-[425px] bg-white/90 p-6 sm:p-8 rounded-2xl shadow-2xl border border-gray-200 fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-center font-semibold text-gray-900">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Are you sure you want to delete this event?
              <span className="block mt-2 text-red-600 font-medium">
                This action cannot be undone.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-4 sm:gap-32 mt-4">
            <Button
              variant="outline"
              onClick={cancelDelete}
              className="w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="w-full sm:w-auto rounded-xl"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}