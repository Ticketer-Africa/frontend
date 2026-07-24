"use client";

import { ChevronDown } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { HomeCard } from "@/components/home/home-card";

const FAQS = [
  {
    question: "How much does it cost to use this platform?",
    answer:
      "There's no upfront cost to create an account or list events. You only pay a small service fee of 5% when tickets are sold, no hidden charges.",
  },
  {
    question: "Are there any hidden fees?",
    answer:
      "Nope. All fees are displayed clearly before any transaction. You'll always see what's deducted and what you earn.",
  },
  {
    question: "How is the service fee deducted?",
    answer:
      "When someone buys a ticket, our service fee(5%) is automatically deducted from the total before it's credited to your wallet. You'll see a detailed breakdown in your dashboard.",
  },
  {
    question: "Do buyers pay extra fees?",
    answer:
      "No, buyers do not pay processing or convenience fee before checkout. We keep everything transparent.",
  },
  {
    question: "How do I get paid for ticket sales?",
    answer:
      "After your event or ticket resale is completed, your earnings are automatically sent to your linked payout account or wallet.",
  },
  {
    question: "When will I receive my payouts?",
    answer:
      "Payouts are processed within 7 business days after your event ends or a resale is confirmed.",
  },
  {
    question: "Are there fees for selling resale tickets?",
    answer:
      "Yes, resale tickets have a 15% total fee. 10% goes to the event organizer, and 5% goes to the platform.",
  },
  {
    question: "How do I check in attendees?",
    answer:
      "You can check in attendees by scanning their tickets. Just scan the ticket QR code, duplicates are automatically flagged.",
  },
] as const;

interface FAQItemProps {
  faq: { question: string; answer: string };
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = memo(function FAQItem({
  faq,
  index,
  isOpen,
  onToggle,
}: FAQItemProps) {
  return (
    <HomeCard tone="elevated" className="faq-item overflow-hidden" style={{ animationDelay: `${index * 50}ms` }}>
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-6 text-left"
        aria-expanded={isOpen}
      >
        <span
          className="font-['Syne'] text-lg"
          style={{ color: "var(--home-text)" }}
        >
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ml-4 ${
            isOpen ? "rotate-180" : ""
          }`}
          style={{ color: "var(--home-accent)" }}
          aria-hidden="true"
        />
      </button>
      <div
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

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visibleFAQs, setVisibleFAQs] = useState(4);

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
        <div className="section-animate text-center mb-16">
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
