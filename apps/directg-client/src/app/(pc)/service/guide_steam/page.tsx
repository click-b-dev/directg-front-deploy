import type { Metadata, Viewport } from "next";

import { ServiceGuideSteamScreen } from "@screens/service-guide-steam";

/** legacy `pc/service/guide_steam.html` head. `$page_title`, 빈 description, author. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "스팀(STEAM) 이용안내",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy guide_steam.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceGuideSteamPage() {
  return <ServiceGuideSteamScreen />;
}
