import type { Metadata, Viewport } from "next";

import { ServiceSitemapScreen } from "@screens/service-sitemap";

/** legacy `pc/service/sitemap.html` head. title="사이트맵", 빈 description. canonical/OG/author 없음. */
export const metadata: Metadata = {
  title: "사이트맵",
  description: "",
};

/** legacy sitemap.html은 `width=device-width, initial-scale=1`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceSitemapPage() {
  return <ServiceSitemapScreen />;
}
