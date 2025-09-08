"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, MapPin, Users, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types/events.type";
import { formatDate, formatPrice, formatTime } from "@/lib/helpers";

interface EventCardProps {
  event: Event;
  onBuyClick?: (event: Event) => void;
}

export function EventCard({ event }: EventCardProps) {
  const availableTickets = event.maxTickets - event.minted;
  const soldOutPercentage = (event.minted / event.maxTickets) * 100;

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.2 }}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          <img
            src={event.bannerUrl || "/placeholder.svg"}
            alt={event.name}
            className="w-full h-48 object-cover"
          />
          {/* {event.featured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
          )} */}
          {/* <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-background/90 text-foreground">
              {event.category}
            </Badge>
          </div> */}
        </div>

        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg text-foreground line-clamp-2 mb-2">
                {event.name}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">
                {event.description}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                <span>
                  {formatDate(event.date)} at {formatTime(event.date)}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-2" />
                <span>{availableTickets} tickets available</span>
              </div>
            </div>

            {/* Progress bar for ticket sales */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{event.minted} sold</span>
                <span>{soldOutPercentage.toFixed(0)}% sold</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${soldOutPercentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-foreground">
                  {formatPrice(event.price)}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Star className="h-3 w-3 mr-1 fill-current text-yellow-500" />
                  <span>4.8 (124 reviews)</span>
                </div>
              </div>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                asChild
              >
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

