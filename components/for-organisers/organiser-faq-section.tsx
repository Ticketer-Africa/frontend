"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { useState, useCallback, memo } from "react";
import { HomeCard } from "@/components/home/home-card";

const FAQS = [
  {
    question: "How do I create an event on Ticketer Africa?",
    answer:
      "Sign up, then use the event creation flow to add your event details, date, venue, ticket categories and pricing. Your event page is ready to share as soon as you publish it.",
  },
  {
    question: "Can I create a free event?",
    answer:
      "Yes. When setting up a ticket category, set its price to zero to offer free tickets alongside or instead of paid ones.",
  },
  {
    question: "Can I sell different types of tickets?",
    answer:
      "Yes. Each event can have multiple ticket categories, for example Regular and VIP, each with its own price and admission limit.",
  },
  {
    question: "How do attendees receive their tickets?",
    answer:
      "After checkout, attendees receive their ticket and QR code by email, no account required.",
  },
  {
    question: "How are tickets validated at the venue?",
    answer:
      "Each ticket has a unique QR code. Scan it at check-in to validate the guest instantly, duplicate scans are automatically flagged.",
  },
  {
    question: "Can I track my ticket sales?",
    answer:
      "Yes. Your organiser dashboard shows tickets sold, revenue and event status, updating as sales come in.",
  },
  {
    question: "Can I create a private event?",
    answer:
      "Not yet. Every published event is currently discoverable on Explore or via its direct link. Private and invite-only events are on our roadmap.",
  },
  {
    question: "When do organisers receive their payouts?",
    answer:
      "Payouts aren't on a fixed schedule. Request a payout from your wallet whenever you need it, and it's processed from there.",
  },
  {
    question: "Can attendees transfer or resell tickets?",
    answer:
      "Tickets aren't directly transferable, but attendees who can no longer attend can list them for resale through our verified resale marketplace.",
  },
  {
    question: "What happens if an attendee loses their ticket email?",
    answer:
      "They should check their spam folder first. If they still can't find it, reach out to us at ticketerafrica@gmail.com for help.",
  },
] as const;

interface FAQItemProps {
  faq: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = memo(function FAQItem({ faq, index, isOpen, onToggle }: FAQItemProps) {
  const panelId = `for-organisers-faq-panel-${index}`;
  const buttonId = `for-organisers-faq-button-${index}`;

  return (
    <HomeCard tone="elevated" className="faq-item overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
      <button
        id={buttonId}
        onClick={onToggle}
        className="w-full flex justify-between items-center p-6 text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="font-['Syne'] text-lg" style={{ color: "var(--home-text)" }}>
          {faq.question}
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? "rotate-180" : ""}`}
          style={{ color: "var(--home-accent)" }}
          aria-hidden="true"
        />
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div
            className="px-6 pb-6 font-['Hanken_Grotesk'] text-sm leading-relaxed"
            style={{ color: "var(--home-muted)" }}
          >
            {faq.answer}
          </div>
        </div>
      </div>
    </HomeCard>
  );
});

export function OrganiserFAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visibleFAQs, setVisibleFAQs] = useState(6);

  const toggleFAQ = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  const loadMore = useCallback(() => {
    setVisibleFAQs((prev) => prev + 4);
  }, []);

  return (
    <section
      id="faq"
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="font-['Syne'] font-bold text-3xl sm:text-4xl lg:text-[48px] tracking-[-1.2px]"
            style={{ color: "var(--home-text)" }}
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.slice(0, visibleFAQs).map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>

        {visibleFAQs < FAQS.length && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-8 py-3 rounded-full font-['Hanken_Grotesk'] text-base transition-colors border"
              style={{
                backgroundColor: "var(--home-badge-bg)",
                borderColor: "var(--home-border-strong)",
                color: "var(--home-text)",
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
