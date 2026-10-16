import type { Metadata, Viewport } from "next";

import { MobileServiceGuideEpicScreen } from "@screens/mobile-service-guide-epic";

/** legacy mobile guide_epic.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile guide_epic.html head: title="Epic Games 이용안내", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "Epic Games 이용안내",
  description: "",
  keywords: "",
};

export default function MobileServiceGuideEpicPage() {
  return <MobileServiceGuideEpicScreen />;
}
