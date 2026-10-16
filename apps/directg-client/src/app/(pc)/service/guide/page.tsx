import type { Metadata, Viewport } from "next";

import { ServiceGuideScreen } from "@screens/service-guide";

/** legacy `pc/service/guide.html` head. `$page_title`, 빈 description, author. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "다이렉트 게임즈(DIRECT GAMES)",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy guide.html은 `width=device-width, initial-scale=1.0` (index.php와 달리 initial-scale 포함). */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceGuidePage() {
  return <ServiceGuideScreen />;
}
