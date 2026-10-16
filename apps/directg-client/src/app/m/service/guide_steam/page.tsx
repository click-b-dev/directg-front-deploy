import type { Metadata, Viewport } from "next";

import { MobileServiceGuideSteamScreen } from "@screens/mobile-service-guide-steam";

/** legacy mobile guide_steam.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile guide_steam.html head: title="Steam 이용안내", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "Steam 이용안내",
  description: "",
  keywords: "",
};

export default function MobileServiceGuideSteamPage() {
  return <MobileServiceGuideSteamScreen />;
}
