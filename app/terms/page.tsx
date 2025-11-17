"use client";

import { motion } from "framer-motion";

export default function TermsAndConditions() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
        </motion.div>

        {/* Terms List */}
        <div className="space-y-10 text-gray-700 leading-relaxed">
          {/* 1. Introduction */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              1. Introduction
            </h2>
            <p>
              Welcome to <span className="font-semibold">Ticketer Africa</span>.
              By using our platform, you agree to these Terms and Conditions. If
              you disagree, please refrain from using the service.
            </p>
          </div>

          {/* 2. Account Registration and Security */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              2. Account Registration & Security
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                You must provide accurate information when creating an account.
              </li>
              <li>
                You are responsible for keeping your account credentials
                confidential.
              </li>
            </ul>
          </div>

          {/* 3. Services Provided */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              3. Services Provided
            </h2>
            <p>
              Ticketer Africa allows users to create and manage events, sell
              tickets, and use our secure ticket resale marketplace. All
              payments and wallet operations are handled through our platform.
            </p>
          </div>

          {/* 4. User Responsibilities */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              4. User Responsibilities
            </h2>
            <ul className="list-disc list-inside space-y-2">
              <li>
                Do not engage in fraudulent activity or manipulate ticket
                prices.
              </li>
              <li>Do not impersonate others or post unauthorized content.</li>
              <li>Do not overload or interfere with our systems.</li>
            </ul>
          </div>

          {/* 5. Intellectual Property */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              5. Intellectual Property
            </h2>
            <p>
              All content, logos, and code on Ticketer Africa are owned by us or
              our licensors and protected under intellectual property laws.
              Unauthorized copying or distribution is prohibited.
            </p>
          </div>

          {/* 6. Payments, Fees, and Refunds */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              6. Payments, Fees & Refunds
            </h2>
            <p>
              All transactions occur in Naira (₦) and are processed through
              Ticketer Africa's wallet system. Service fees are automatically
              deducted for ticket sales and resale transactions. Refunds, where
              applicable, are processed according to the organizer's refund
              policy.
            </p>
          </div>

          {/* 7. Ticket Resale Policy */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              7. Ticket Resale Policy
            </h2>
            <p>
              Ticketer Africa provides a verified marketplace for ticket resale.
              Only legitimate tickets may be resold, and resale fees are split:
              10% to the organizer, 5% to the platform. Fraudulent resale
              activity will lead to account suspension.
            </p>
          </div>

          {/* 8. Liability and Disclaimers */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              8. Liability & Disclaimers
            </h2>
            <p>
              Ticketer Africa is not responsible for event cancellations, ticket
              misuse, or disputes between organizers and attendees. The platform
              is provided “as is” with no guarantee of uninterrupted service.
            </p>
          </div>

          {/* 9. Termination of Service */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              9. Termination of Service
            </h2>
            <p>
              We may suspend or terminate accounts that violate these Terms or
              misuse the platform, with or without notice.
            </p>
          </div>

          {/* 10. Governing Law & Dispute Resolution */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              10. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms are governed by the laws of Nigeria. Disputes will be
              resolved through arbitration in Lagos, following the Arbitration
              and Mediation Act, 2023.
            </p>
          </div>

          {/* 11. Contact Information */}
          <div>
            <h2 className="font-bold text-xl text-gray-900 mb-2">
              11. Contact Information
            </h2>
            <p>
              For any questions regarding these Terms, contact us at{" "}
              <a
                href="mailto:ticketerafrica@gmail.com"
                className="text-[#1E88E5] font-medium hover:underline"
              >
                ticketerafrica@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
