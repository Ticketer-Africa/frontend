"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Calendar,
  Users,
  TrendingUp,
  BarChart3,
  Trash2,
  MoreVertical,
  Edit,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/helpers";
import { Header } from "@/components/layout/header";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
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

export default function OrganizerDashboard() {
  const { isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();
  const { data: organizerEventList, isLoading: eventsLoading } =
    useOrganizerEvents();
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
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  const organizerEvents = Array.isArray(organizerEventList)
    ? organizerEventList
    : [];

  // Safe calculations
  const totalEvents = organizerEvents?.length || 0;
  const totalTicketsSold =
    organizerEvents?.reduce((eventsum, event: Event) => {
      const eventMinted =
        event.ticketCategories?.reduce(
          (catSum, cat) => catSum + (cat.minted || 0),
          0
        ) || 0;
      return eventsum + eventMinted;
    }, 0) || 0;
  const totalRevenue =
    organizerEvents?.reduce((sum, event: Event) => {
      const eventRevenue =
        event.ticketCategories?.reduce((catSum, cat) => {
          return catSum + (cat.minted || 0) * (cat.price || 0);
        }, 0) || 0;
      return sum + eventRevenue;
    }, 0) || 0;

  const avgTicketsSold =
    totalEvents > 0 ? Math.round(totalTicketsSold / totalEvents) : 0;

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
              <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Welcome back, {currentUser && currentUser.name}!
              </p>
            </div>
            <Button
              asChild
              className="w-full sm:w-auto bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full px-6 py-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/organizer/create-event">
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
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
                    Total Events
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalEvents}
                  </div>
                  <p className="text-xs text-muted-foreground">Active events</p>
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
                  <div className="text-xl sm:text-2xl font-bold">
                    {totalTicketsSold}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Across all events
                  </p>
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

          {/* Events List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl sm:text-2xl">
                  Your Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {organizerEvents?.length > 0 ? (
                  <div className="space-y-4">
                    {organizerEvents?.map((event: Event, index: number) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() =>
                          router.push(`/organizer/view-event/${event.id}`)
                        }
                      >
                        <img
                          src={event.bannerUrl || "/placeholder.svg"}
                          alt={event.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 w-full sm:w-auto">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                            <h3 className="font-semibold text-sm sm:text-base">
                              {event.name}
                            </h3>
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                            {new Date(event.date).toLocaleDateString()} •{" "}
                            {event.location}
                          </p>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                            <span className="text-muted-foreground">
                              {event.ticketCategories?.reduce(
                                (sum, cat) => sum + (cat.minted || 0),
                                0
                              )}
                              /
                              {event.ticketCategories?.reduce(
                                (sum, cat) => sum + (cat.maxTickets || 0),
                                0
                              )}{" "}
                              sold
                            </span>
                            <span className="text-green-600 font-medium">
                              {formatPrice(
                                event.ticketCategories?.reduce(
                                  (sum, cat) =>
                                    sum + (cat.minted || 0) * (cat.price || 0),
                                  0
                                ) || 0
                              ).toLocaleString()}{" "}
                              revenue
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end w-full sm:w-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              side="right"
                              className="bg-white shadow-lg rounded-md border border-gray-200 mt-2"
                            >
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/organizer/update-event/${event.id}`
                                  )
                                }
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
                          <div className="w-full sm:w-24 bg-muted rounded-full h-2 mt-2">
                            <div
                              className="bg-gradient-to-r from-blue-600 to-pink-600 h-2 rounded-full"
                              style={{
                                width: `${
                                  event.ticketCategories
                                    ? (event.ticketCategories.reduce(
                                        (sum, cat) => sum + (cat.minted || 0),
                                        0
                                      ) /
                                        event.ticketCategories.reduce(
                                          (sum, cat) =>
                                            sum + (cat.maxTickets || 0),
                                          0
                                        )) *
                                      100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground mt-1 text-right">
                            {event.ticketCategories
                              ? Math.round(
                                  (event.ticketCategories.reduce(
                                    (sum, cat) => sum + (cat.minted || 0),
                                    0
                                  ) /
                                    event.ticketCategories.reduce(
                                      (sum, cat) => sum + (cat.maxTickets || 0),
                                      0
                                    )) *
                                    100
                                )
                              : 0}
                            % sold
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No events yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first event to start selling tickets and
                      managing attendees.
                    </p>
                    <Button asChild>
                      <Link href="/organizer/create-event">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Event
                      </Link>
                    </Button>
                  </div>
                )}
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
