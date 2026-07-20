export default function TermsAndConditions() {
  return (
    <section
      className="home-theme min-h-screen px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-10 text-center sm:mb-12">
          <h1
            className="mb-4 text-4xl font-bold sm:text-5xl"
            style={{ color: "var(--home-text)" }}
          >
            Terms and Conditions
          </h1>
        </div>

        {/* Terms List */}
        <div
          className="divide-y divide-[var(--home-border)] rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 leading-relaxed shadow-sm sm:p-10"
          style={{ color: "var(--home-muted)" }}
        >
          {/* 1. Introduction */}
          <div className="pb-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              1. Introduction
            </h2>
            <p>
              Welcome to <span className="font-semibold">Ticketer Africa</span>.
              By using our platform, you agree to these Terms and Conditions. If
              you disagree, please refrain from using the service.
            </p>
          </div>

          {/* 2. Account Registration and Security */}
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
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
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              3. Services Provided
            </h2>
            <p>
              Ticketer Africa allows users to create and manage events, sell
              tickets, and use our secure ticket resale marketplace. All
              payments and wallet operations are handled through our platform.
            </p>
          </div>

          {/* 4. User Responsibilities */}
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
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
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              5. Intellectual Property
            </h2>
            <p>
              All content, logos, and code on Ticketer Africa are owned by us or
              our licensors and protected under intellectual property laws.
              Unauthorized copying or distribution is prohibited.
            </p>
          </div>

          {/* 6. Payments, Fees, and Refunds */}
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              6. Payments, Fees & Refunds
            </h2>
            <p>
              All transactions occur in Naira (₦) and are processed through
              Ticketer Africa&apos;s wallet system. Service fees are automatically
              deducted for ticket sales and resale transactions. Refunds, where
              applicable, are processed according to the organizer&apos;s refund
              policy.
            </p>
          </div>

          {/* 7. Ticket Resale Policy */}
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
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
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              8. Liability & Disclaimers
            </h2>
            <p>
              Ticketer Africa is not responsible for event cancellations, ticket
              misuse, or disputes between organizers and attendees. The platform
              is provided “as is” with no guarantee of uninterrupted service.
            </p>
          </div>

          {/* 9. Termination of Service */}
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              9. Termination of Service
            </h2>
            <p>
              We may suspend or terminate accounts that violate these Terms or
              misuse the platform, with or without notice.
            </p>
          </div>

          {/* 10. Governing Law & Dispute Resolution */}
          <div className="py-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              10. Governing Law & Dispute Resolution
            </h2>
            <p>
              These Terms are governed by the laws of Nigeria. Disputes will be
              resolved through arbitration in Lagos, following the Arbitration
              and Mediation Act, 2023.
            </p>
          </div>

          {/* 11. Contact Information */}
          <div className="pt-8">
            <h2
              className="mb-2 text-xl font-bold"
              style={{ color: "var(--home-text)" }}
            >
              11. Contact Information
            </h2>
            <p>
              For any questions regarding these Terms, contact us at{" "}
              <a
                href="mailto:ticketerafrica@gmail.com"
                className="font-medium hover:underline"
                style={{ color: "var(--home-text-highlight)" }}
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
