import type { Metadata, Viewport } from "next";

import { ServiceGuideEpicScreen } from "@screens/service-guide-epic";

/**
 * legacy `pc/service/guide_epic.html` head. `$page_title`, 빈 description.
 * author도 **빈값**(`<meta name="author" content="">`) — guide/steam(H2interactive)과 다름. canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "에픽 게임즈(EPIC GAMES) 이용안내",
  description: "",
  authors: [{ name: "" }],
};

/** legacy guide_epic.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceGuideEpicPage() {
  return <ServiceGuideEpicScreen />;
}
