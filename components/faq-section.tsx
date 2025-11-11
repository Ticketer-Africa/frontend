"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState, useCallback, memo } from "react";
import { debounce } from "lodash";

const faqs = [
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
];

interface FAQItemProps {
  faq: { question: string; answer: string };
  index: number;
  openIndex: number | null;
  toggleFAQ: (index: number) => void;
}

const FAQItem = memo(({ faq, index, openIndex, toggleFAQ }: FAQItemProps) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-all">
    <button
      onClick={() => toggleFAQ(index)}
      className="w-full flex justify-between items-center p-6 text-left"
    >
      <span className="text-lg font-medium text-gray-900">{faq.question}</span>
      <ChevronDown
        className={`w-5 h-5 text-[#1E88E5] transition-transform duration-300 ${
          openIndex === index ? "rotate-180" : ""
        }`}
      />
    </button>
    {openIndex === index && (
      <motion.div
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="px-6 pb-6 text-gray-600 leading-relaxed will-change-opacity"
      >
        {faq.answer}
      </motion.div>
    )}
  </div>
));

FAQItem.displayName = "FAQItem";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [visibleFAQs, setVisibleFAQs] = useState(4); // Show 4 FAQs initially

  const toggleFAQ = useCallback(
    debounce((index: number) => {
      setOpenIndex((prev) => (prev === index ? null : index));
    }, 200),
    []
  );

  const loadMore = () => {
    setVisibleFAQs((prev) => prev + 4);
  };

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about using our platform for events and
            ticket resale.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.slice(0, visibleFAQs).map((faq, index) => (
            <FAQItem
              key={faq.question}
              faq={faq}
              index={index}
              openIndex={openIndex}
              toggleFAQ={toggleFAQ}
            />
          ))}
        </div>

        {visibleFAQs < faqs.length && (
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
