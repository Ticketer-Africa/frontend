"use client";

import { motion } from "framer-motion";
import { MapPin, Users } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAllEvents } from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
import { truncateText } from "@/utils/trauncate";

export function EventsSection() {
  const router = useRouter();
  const { data: events } = useAllEvents();

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover amazing events happening near you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events?.map((event: Event, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => router.push(`/events/${event.slug}`)}
              className="cursor-pointer group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                {/* Banner */}
                <div className="relative">
                  <Image
                    src={event.bannerUrl || "/placeholder.svg"}
                    alt={event.name}
                    width={400}
                    height={250}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {event.name}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4">
                    {truncateText(event.description, 10)} {/* 20 words max */}
                  </p>

                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{truncateText(event.location, 5)}</span>
                  </div>

                  {/* <div className="flex items-center text-gray-600 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {event.ticketCategories
                        ? event.ticketCategories.reduce((acc, cur) => acc + (cur.minted ?? 0), 0)
                        : 0} attending
                    </span>
                  </div> */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
