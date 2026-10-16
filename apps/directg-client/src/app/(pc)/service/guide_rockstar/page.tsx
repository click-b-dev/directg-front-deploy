import type { Metadata, Viewport } from "next";

import { ServiceGuideRockstarScreen } from "@screens/service-guide-rockstar";

/** legacy `pc/service/guide_rockstar.html` head. `$page_title`, 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "락스타 게임즈(ROCKSTAR GAMES) 이용안내",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy guide_rockstar.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceGuideRockstarPage() {
  return <ServiceGuideRockstarScreen />;
}
