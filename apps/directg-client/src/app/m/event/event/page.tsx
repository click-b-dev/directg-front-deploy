import type { Metadata, Viewport } from "next";

import { getEvents } from "@entities/event";
import { MobileEventListScreen } from "@screens/mobile-event-list";

/** legacy mobile event.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile event.html head: title="이벤트", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "이벤트",
  description: "",
  keywords: "",
};

export default async function MobileEventPage() {
  const data = await getEvents();
  return <MobileEventListScreen data={data} />;
}
