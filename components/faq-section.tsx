"use client";

import { ChevronDown } from "lucide-react";
import { useState, useCallback, memo } from "react";

/**
 * Static FAQ data - hoisted outside component
 * Performance: Prevents recreation on every render
 */
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

/**
 * FAQItem - Memoized accordion item
 * Performance: Uses instant layout changes and opacity-only disclosure feedback.
 */
interface FAQItemProps {
  faq: { question: string; answer: string };
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = memo(function FAQItem({
  faq,
  isOpen,
  onToggle,
}: FAQItemProps) {
  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-[background-color,color,border-color,opacity,transform] faq-item"
    >
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-6 text-left"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-medium text-gray-900">
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-[#1E88E5] transition-transform duration-150 flex-shrink-0 ml-4 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
      <div
        className={`grid transition-opacity duration-150 [transition-timing-function:var(--motion-ease-out)] ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 text-gray-600 leading-relaxed">
            {faq.answer}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * FAQSection - Optimized for performance
 *
 * Performance optimizations:
 * 1. Removed framer-motion and decorative entrance animations
 * 2. Removed lodash debounce - not needed for simple toggle
 * 3. Disclosure layout updates immediately while opacity provides light feedback
 * 4. Memoized FAQItem component
 * 5. Static data hoisted outside component
 */
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
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Section header with CSS animation */}
        <div className="section-animate text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using our platform for events and
            ticket resale.
          </p>
        </div>

        {/* FAQ items */}
        <div className="space-y-4">
          {FAQS.slice(0, visibleFAQs).map((faq, index) => (
          <FAQItem
            key={faq.question}
            faq={faq}
            isOpen={openIndex === index}
            onToggle={() => toggleFAQ(index)}
          />
          ))}
        </div>

        {visibleFAQs < FAQS.length && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              className="px-6 py-3 bg-[#1E88E5] text-white rounded-lg hover:bg-blue-700 transition"
            >
              Show More
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
