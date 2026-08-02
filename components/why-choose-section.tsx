"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Award01Icon, FavouriteIcon, FlashIcon, Shield01Icon } from "@hugeicons/core-free-icons";

const benefits = [
  {
    icon: Shield01Icon,
    title: "Verified & Secure",
    description:
      "All tickets are verified and transactions are protected with bank-level security.",
    color: "text-green-600",
  },
  {
    icon: FlashIcon,
    title: "Lightning Fast",
    description:
      "Get your tickets instantly with our optimized checkout process.",
    color: "text-yellow-600",
  },
  {
    icon: FavouriteIcon,
    title: "Customer First",
    description:
      "24/7 support and hassle-free refunds ensure your satisfaction.",
    color: "text-red-600",
  },
  {
    icon: Award01Icon,
    title: "Best Prices",
    description:
      "Compare prices and find the best deals with our price guarantee.",
    color: "text-[#1E88E5]",
  },
];

export function WhyChooseSection() {
  const router = useRouter();
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Why Choose Ticketer Africa?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&apos;re not just another ticketing platform. We&apos;re your trusted
            partner for unforgettable experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="text-center group"
            >
              <div className="relative mb-6">
                <div
                  className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center group-hover:scale-[1.02] transition-transform duration-150 shadow-lg`}
                >
                  <HugeiconsIcon icon={benefit.icon} className={`w-8 h-8 ${benefit.color}`} />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {benefit.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gradient-to-r from-[#1E88E5] to-[#1E88E5] rounded-3xl p-12 text-white">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to get started?
          </h3>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of happy customers who trust Ticketer Africa for
            their events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/events")}
              className="bg-white text-[#1E88E5] px-8 py-3 rounded-full font-semibold hover:bg-gray-100 motion-press active:scale-[0.98]"
            >
              Start Exploring
            </button>
            <button
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#1E88E5] motion-press active:scale-[0.98]"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
