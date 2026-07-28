"use client";

import dynamic from "next/dynamic";
import { Footer } from "@/components/layout/footer";
import { OrganiserHeroSection } from "@/components/for-organisers/organiser-hero-section";
import { HomeCard } from "@/components/home/home-card";

function SectionSkeleton({ height }: { height: string }) {
  return (
    <div
      className="home-theme py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: "var(--home-bg)" }}
      aria-hidden="true"
    >
      <div className="max-w-7xl mx-auto">
        <HomeCard className={`w-full ${height} animate-pulse`}>{null}</HomeCard>
      </div>
    </div>
  );
}

const OrganiserProcessSection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-process-section").then(
      (m) => ({ default: m.OrganiserProcessSection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[600px]" /> }
);

const OrganiserPerformanceSection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-performance-section").then(
      (m) => ({ default: m.OrganiserPerformanceSection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[420px]" /> }
);

const OrganiserCheckinSection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-checkin-section").then(
      (m) => ({ default: m.OrganiserCheckinSection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[480px]" /> }
);

const OrganiserAttendeeSection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-attendee-section").then(
      (m) => ({ default: m.OrganiserAttendeeSection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[500px]" /> }
);

const OrganiserCommunitySection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-community-section").then(
      (m) => ({ default: m.OrganiserCommunitySection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[420px]" /> }
);

const OrganiserPayoutsSection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-payouts-section").then(
      (m) => ({ default: m.OrganiserPayoutsSection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[360px]" /> }
);

const OrganiserFAQSection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-faq-section").then(
      (m) => ({ default: m.OrganiserFAQSection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[500px]" /> }
);

const OrganiserFinalCTASection = dynamic(
  () =>
    import("@/components/for-organisers/organiser-final-cta-section").then(
      (m) => ({ default: m.OrganiserFinalCTASection })
    ),
  { ssr: false, loading: () => <SectionSkeleton height="h-[320px]" /> }
);

export default function ForOrganisersPage() {
  return (
    <div className="home-theme" style={{ backgroundColor: "var(--home-bg)" }}>
      <OrganiserHeroSection />
      <OrganiserProcessSection />
      <OrganiserPerformanceSection />
      <OrganiserCheckinSection />
      <OrganiserAttendeeSection />
      <OrganiserCommunitySection />
      <OrganiserPayoutsSection />
      <OrganiserFAQSection />
      <OrganiserFinalCTASection />
      <Footer />
    </div>
  );
}
