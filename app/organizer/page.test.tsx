import { describe, expect, it } from "vitest";
import { EVENT_CARD_MEDIA_CLASS } from "./page";

describe("organizer event card media", () => {
  it("uses a stable responsive frame for every event image", () => {
    expect(EVENT_CARD_MEDIA_CLASS).toContain("h-48");
    expect(EVENT_CARD_MEDIA_CLASS).toContain("sm:h-56");
    expect(EVENT_CARD_MEDIA_CLASS).toContain("overflow-hidden");
  });
});
