"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Search,
  SlidersHorizontal,
  Loader2,
  Ticket,
} from "lucide-react";
import { formatPrice, formatDate, formatTime } from "@/lib/helpers";
import { useAllEvents } from "@/services/events/events.queries";
import { Event, TicketCategory } from "@/types/events.type";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: events, isLoading: eventsLoading } = useAllEvents();

  if (eventsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#1E88E5] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

const locations: string[] = Array.from(
  new Set(
    events
      ?.map((event: Event) => {
        if (!event.location) return null;
        const parts = event.location.split(",");
        return parts.length > 1 ? parts[1].trim() : event.location.trim();
      })
      .filter(Boolean)
  )
);


// Gather all ticket prices from every event
const allPrices = events
  ?.flatMap((event: Event) =>
    event.ticketCategories?.map((t: TicketCategory) => t.price)
  )
  .filter((price: number) => typeof price === "number" && price >= 0);

let priceRanges: { label: string; value: string }[] = [];

if (allPrices?.length) {
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);

  if (minPrice < 5000)
    priceRanges.push({ label: "Under ₦5,000", value: "0-5000" });

  if (maxPrice > 5000)
    priceRanges.push({ label: "₦5,000 - ₦10,000", value: "5000-10000" });

  if (maxPrice > 10000)
    priceRanges.push({ label: "₦10,000 - ₦50,000", value: "10000-50000" });

  if (maxPrice > 20000)
    priceRanges.push({ label: "Over ₦50,000", value: "50000" });
}


  const categories = [
    "Music",
    "Concert",
    "Conference",
    "Workshop",
    "Sports",
    "Comedy",
    "Theatre",
    "Festival",
    "Exhibition",
    "Religion",
    "Networking",
    "Tech",
    "Fashion",
    "Party",
  ];

  const filteredEvents = events?.filter((event: Event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLocation =
      !selectedLocation || event.location.includes(selectedLocation);
    const matchesCategory =
      !selectedCategory ||
      event.category.toLowerCase() === selectedCategory.toLowerCase();

    let matchesPrice = true;
    if (priceRange && event.ticketCategories?.length) {
  matchesPrice = event.ticketCategories.some((t: TicketCategory) => {
    const price = t.price;

    switch (priceRange) {
      case "0-5000":
        return price >= 0 && price <= 5000;
      case "5000-10000":
        return price >= 5000 && price <= 10000;
      case "10000-50000":
        return price >= 10000 && price <= 50000;
      case "50000":
        return price >= 50000;
      default:
        return true;
    }
  });
}


    return matchesSearch && matchesLocation && matchesCategory && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find and book tickets for the best events happening near you
          </p>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search events, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 bg-gray-50 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 border-gray-200 hover:bg-gray-50 rounded-xl bg-transparent"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
                {(selectedLocation || priceRange || selectedCategory) && (
                  <Badge variant="secondary" className="ml-2">
                    {
                      [selectedLocation, priceRange, selectedCategory].filter(
                        Boolean
                      ).length
                    }
                  </Badge>
                )}
              </Button>
              <p className="text-sm text-gray-600">
                {filteredEvents?.length} events found
              </p>
            </div>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
                className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All locations</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All prices</option>
                    {priceRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents?.map((event: Event, idx: number) => {
            const ticketCategories = event.ticketCategories || [];
            const maxTickets = ticketCategories.reduce(
              (sum, t) => sum + t.maxTickets,
              0
            );
            const mintedTickets = ticketCategories.reduce(
              (sum, t) => sum + t.minted,
              0
            );
            const ticketsAvailable = maxTickets - mintedTickets;

            const minPrice = ticketCategories.length
              ? Math.min(...ticketCategories.map((t) => t.price))
              : 0;
            const priceRangeDisplay =
              minPrice > 0 ? `From ${formatPrice(minPrice)}` : "Free";

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group"
              >
                <Link href={`/events/${event.slug}`}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                    {/* Image */}
                    <div className="relative flex-shrink-0">
                      <Image
                        src={event.bannerUrl || "/placeholder.svg"}
                        alt={event.name}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Category badge */}
                      <div className="absolute top-4 left-4 capitalize bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-blue-600">
                        {event.category}
                      </div>
                      {/* Almost sold out badge */}
                      {ticketsAvailable > 0 &&
                        mintedTickets / maxTickets > 0.8 && (
                          <div className="absolute top-12 left-4">
                            <Badge variant="destructive" className="bg-red-500">
                              Almost Sold Out
                            </Badge>
                          </div>
                        )}
                    </div>

                    {/* Price badge moved below image */}
                    <div className="flex justify-end px-4 -mt-8 mb-2 flex-shrink-0">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-blue-600 shadow-sm">
                        {priceRangeDisplay}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col justify-between flex-grow space-y-2">
                      {/* Event title */}
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {event.name}
                      </h3>

                      {/* Date & Location */}
                      <div className="space-y-1 text-gray-600 text-sm min-h-[60px]">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span>
                            {formatDate(event.date)} at {formatTime(event.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {/* Tickets */}
                      <div className="text-gray-600 min-h-[100px]">
                        <div className="flex items-center mb-1">
                          <Ticket className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm font-medium">
                            Ticket Options
                          </span>
                        </div>
                        <div className="space-y-2">
                          {ticketCategories.slice(0, 1).map((ticket) => (
                            <div
                              key={ticket.id}
                              className="flex justify-between items-center text-sm"
                            >
                              <span className="line-clamp-1">
                                {ticket.name} (
                                {ticket.price === 0
                                  ? "Free"
                                  : formatPrice(ticket.price)}
                                )
                              </span>
                              <span
                                className={
                                  ticket.maxTickets - ticket.minted < 5
                                    ? "text-red-500 font-medium"
                                    : "text-gray-600"
                                }
                              >
                                {ticket.maxTickets - ticket.minted} of{" "}
                                {ticket.maxTickets} available
                              </span>
                            </div>
                          ))}
                          {ticketCategories.length > 1 && (
                            <div className="text-sm text-gray-500">
                              +{ticketCategories.length - 1} more options
                            </div>
                          )}
                        </div>
                      </div>

                      {/* View details button */}
                      <Button
                        size="lg"
                        className="w-full bg-[#1E88E5] hover:bg-blue-500 text-white rounded-full font-semibold mt-auto"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {filteredEvents?.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedLocation("");
                setPriceRange("");
                setSelectedCategory("");
              }}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-full bg-transparent"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
