"use client";

import { motion } from "framer-motion";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAllEvents } from "@/services/events/events.queries";
import { Event } from "@/types/events.type";
import { truncateText } from "@/utils/trauncate";
import { Button } from "@/components/ui/button";

export function EventsSection() {
  const router = useRouter();
  const { data: events } = useAllEvents();

  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-blue-50/20 to-white overflow-hidden">
      {/* Light Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-100/20 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
            <Calendar className="w-4 h-4" />
            Discover Amazing Events
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent mb-6">
            Upcoming Events
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Connect, celebrate, and create memories at events that matter to you
          </p>
        </motion.div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {events?.slice(0, 3).map((event: Event, index: number) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => router.push(`/events/${event.slug}`)}
              className="cursor-pointer group"
            >
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100/50">
                {/* Floating Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-blue-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Featured
                  </div>
                </div>

                {/* Banner */}
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={event.bannerUrl || "/placeholder.svg"}
                    alt={event.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Event Content */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {event.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed line-clamp-3">
                    {truncateText(event.description, 15)}
                  </p>

                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{truncateText(event.location, 6)}</span>
                  </div>

                  {/* Hover Action */}
                  <div className="mt-4 flex items-center text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-1 group-hover:translate-y-0">
                    <span className="font-medium text-sm">View Details</span>
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={() => router.push("/explore")}
            className="relative group bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-6 text-lg font-semibold rounded-2xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 border-0 overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explore More Events
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
