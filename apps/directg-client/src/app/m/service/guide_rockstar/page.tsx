import type { Metadata, Viewport } from "next";

import { MobileServiceGuideRockstarScreen } from "@screens/mobile-service-guide-rockstar";

/** legacy mobile guide_rockstar.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile guide_rockstar.html head: title="RockStar Games 이용안내"(대문자 S), keywords="l" quirk. */
export const metadata: Metadata = {
  title: "RockStar Games 이용안내",
  description: "",
  keywords: "l",
};

export default function MobileServiceGuideRockstarPage() {
  return <MobileServiceGuideRockstarScreen />;
}
