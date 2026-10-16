import type { Metadata, Viewport } from "next";

import { getEvents } from "@entities/event";
import { EventListScreen } from "@screens/event-list";

/** legacy `pc/event/event.html` head. title="이벤트", 빈 description, author=H2interactive. */
export const metadata: Metadata = {
  title: "이벤트",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy event.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function EventPage() {
  const data = await getEvents();
  return <EventListScreen data={data} />;
}
