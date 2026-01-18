/**
 * V2 Event Page Header Component
 * Displays event banner, title, date, location, and organizer info
 */

"use client";

import { EventV2 } from "@/types/events-v2.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, User } from "lucide-react";
import Image from "next/image";

interface EventHeaderV2Props {
  event: EventV2;
}

export function EventHeaderV2({ event }: EventHeaderV2Props) {
  const eventDate = new Date(event.date);
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = eventDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full">
      {/* Banner */}
      {event.bannerUrl && (
        <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden rounded-lg">
          <Image
            src={event.bannerUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Event Title and Meta */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          {event.name}
        </h1>

        {/* Event Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Date */}
          <div className="flex items-start space-x-3">
            <Calendar className="w-5 h-5 text-[#1E88E5] mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Date & Time
              </p>
              <p className="text-foreground">
                {formattedDate}
                <br />
                <span className="text-sm">{formattedTime}</span>
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-[#1E88E5] mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Location
              </p>
              <p className="text-foreground">{event.location}</p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start space-x-3">
            <User className="w-5 h-5 text-[#1E88E5] mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Category
              </p>
              <p className="text-foreground">{event.category}</p>
            </div>
          </div>
        </div>

        {/* Organizer Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Organizer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={event.organizer.profileImage}
                  alt={event.organizer.name}
                />
                <AvatarFallback>
                  {event.organizer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-foreground">
                  {event.organizer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.organizer.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
