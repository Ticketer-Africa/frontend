import Link from "next/link";

const sections = [
  {
    title: "1. Definitions",
    items: [
      "1.1 “Platform” means the digital ticketing and event management system operated by Ticketer Africa Ltd.",
      "1.2 “Event” means any event listed by Organizer for ticket sale on the Platform.",
      "1.3 “Ticket” means a digital access credential issued through the Platform.",
      "1.4 “Primary Sale” means the first sale of a Ticket to an attendee.",
      "1.5 “Resale” means any subsequent transfer of a Ticket conducted exclusively through the Platform.",
      "1.6 “Organizer Wallet” means the designated internal account where Event proceeds are held for the Organizer.",
      "1.7 “Commission” means the fees payable to Ticketer as defined in Section 3.",
    ],
  },
  {
    title: "2. Scope of Services",
    items: [
      "2.1 Ticketer provides technology services enabling Organizers to create, manage, promote, and sell digital Tickets.",
      "2.2 Ticketer facilitates controlled ticket resale exclusively within its Platform.",
      "2.3 Ticketer acts solely as a technology service provider and is not responsible for Event execution, artist performance, venue compliance, safety, or force majeure events.",
    ],
  },
  {
    title: "3. Commission and Fee Structure",
    items: [
      "3.1 Ticketer shall earn a commission on each Primary Sale, calculated as either a percentage of ticket value or a flat fee per ticket, as agreed in writing.",
      "3.2 Ticketer shall earn a commission on all Resale transactions conducted through the Platform.",
      "3.3 All commissions may be deducted prior to disbursement of funds to the Organizer.",
      "3.4 Ticketer reserves the right to update fees upon prior written notice.",
    ],
  },
  {
    title: "4. Controlled Resale Policy",
    items: [
      "4.1 Tickets may only be resold through the Platform.",
      "4.2 Resale pricing may be capped or controlled by Ticketer to prevent scalping and preserve Event integrity.",
      "4.3 Tickets resold outside the Platform are strictly prohibited.",
      "4.4 Ticketer reserves the right to invalidate Tickets transferred or resold outside its system.",
    ],
  },
  {
    title: "5. Organizer Wallet and Fund Handling",
    items: [
      "5.1 All ticket revenue shall be held in the Organizer Wallet.",
      "5.2 The Organizer Wallet is not a consumer wallet and may only hold Event proceeds for Organizer use.",
      "5.3 Ticketer may deduct commissions, processing fees, refunds, chargebacks, or penalties before disbursement.",
    ],
  },
  {
    title: "6. Disbursement Terms",
    items: [
      "6.1 Net ticket proceeds shall be disbursed to the Organizer one (1) day after the Event date.",
      "6.2 Ticketer reserves the right to delay disbursement in cases involving suspected fraud, disputes, chargebacks, investigations, or policy violations.",
    ],
  },
  {
    title: "7. Fraud Prevention and Ticket Invalidation Rights",
    items: [
      "7.1 Ticketer employs fraud detection, digital ownership tracking, and resale control systems.",
      "7.2 Ticketer may suspend accounts, block transfers, or invalidate Tickets suspected of fraud or policy violation.",
      "7.3 Ticketer’s decisions regarding fraud investigations shall be final pending review.",
    ],
  },
  {
    title: "8. Refunds, Cancellations, and Chargebacks",
    items: [
      "8.1 Organizer is responsible for determining refund policies for Events.",
      "8.2 In the event of cancellation, Organizer shall be responsible for refund costs unless otherwise agreed.",
      "8.3 Chargebacks and payment disputes may be deducted from Organizer proceeds.",
    ],
  },
  {
    title: "9. Organizer Responsibilities",
    items: [
      "9.1 Organizer warrants that it has full authority to host and promote the Event.",
      "9.2 Organizer shall comply with all applicable laws, venue regulations, and licensing requirements.",
      "9.3 Organizer shall not engage in deceptive, fraudulent, or unlawful conduct.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    items: [
      "10.1 Ticketer shall not be liable for indirect, incidental, or consequential damages.",
      "10.2 Ticketer’s total liability shall not exceed the total commissions earned for the applicable Event.",
    ],
  },
  {
    title: "11. Intellectual Property Ownership",
    items: [
      "11.1 Ticketer retains all rights to its software, systems, trademarks, and technology.",
      "11.2 Organizer retains ownership of Event content and branding provided to the Platform.",
    ],
  },
  {
    title: "12. Data Protection and Privacy",
    items: [
      "12.1 Ticketer shall process personal data in accordance with applicable data protection laws.",
      "12.2 Organizer agrees to use attendee data solely for lawful Event-related purposes.",
    ],
  },
  {
    title: "13. Term and Termination",
    items: [
      "13.1 This Agreement becomes effective upon acceptance and remains in effect until terminated.",
      "13.2 Either party may terminate upon written notice.",
      "13.3 Ticketer may suspend or terminate access for policy violations or unlawful activity.",
    ],
  },
  {
    title: "14. Governing Law",
    items: [
      "14.1 This Agreement shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, unless otherwise agreed in writing.",
    ],
  },
];

export default function ServiceAgreementPage() {
  return (
    <main
      className="home-theme min-h-screen px-4 py-16 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-[var(--home-border)] bg-[var(--home-card)] p-6 shadow-sm sm:p-10">
          <h1
            className="text-2xl font-bold leading-tight sm:text-4xl"
            style={{ color: "var(--home-text)" }}
          >
            EVENT HOSTING AND TICKETING PLATFORM AGREEMENT
          </h1>

          <p
            className="mt-6 leading-7"
            style={{ color: "var(--home-muted)" }}
          >
            This Event Hosting and Ticketing Platform Agreement
            (&quot;Agreement&quot;) is entered into by and between Ticketer
            Africa Ltd (&quot;Ticketer&quot; or the &quot;Platform&quot;), and
            the event organizer accepting this Agreement
            (&quot;Organizer&quot;). This Agreement governs the Organizer’s use
            of the Ticketer digital ticketing platform and related services.
          </p>

          <div className="mt-8 divide-y divide-[var(--home-border)]">
            {sections.map((section) => (
              <section key={section.title} className="py-8 first:pt-0 last:pb-0">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--home-text)" }}
                >
                  {section.title}
                </h2>
                <ul
                  className="mt-3 space-y-2 leading-7"
                  style={{ color: "var(--home-muted)" }}
                >
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div
            className="mt-10 border-t border-[var(--home-border)] pt-6 text-sm"
            style={{ color: "var(--home-muted)" }}
          >
            To continue registration, return to{" "}
            <Link
              href="/register"
              className="hover:underline"
              style={{ color: "var(--home-text-highlight)" }}
            >
              Create Account
            </Link>{" "}
            and accept this agreement.
          </div>
        </div>
      </div>
    </main>
  );
}
