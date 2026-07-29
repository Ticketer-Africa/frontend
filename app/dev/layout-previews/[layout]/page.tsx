import { LAYOUT_COMPONENTS } from "@/app/events/_shared/layouts/registry";
import { buildDummyEventLayoutViewModel } from "@/lib/dummy-event-fixture";
import { EventLayout } from "@/types/events-v2.type";
import { notFound } from "next/navigation";

const VALID_LAYOUTS = Object.keys(LAYOUT_COMPONENTS) as EventLayout[];

export default function LayoutPreviewPage({ params }: { params: { layout: string } }) {
  const layout = params.layout.toUpperCase().replace(/-/g, "_") as EventLayout;
  if (!VALID_LAYOUTS.includes(layout)) notFound();

  const Component = LAYOUT_COMPONENTS[layout];
  return <Component event={buildDummyEventLayoutViewModel(layout)} mode="preview" />;
}
