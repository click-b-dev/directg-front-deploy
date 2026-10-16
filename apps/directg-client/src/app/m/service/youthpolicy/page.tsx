import type { Metadata, Viewport } from "next";

import { MobileServiceYouthpolicyScreen } from "@screens/mobile-service-youthpolicy";

/** legacy mobile youthpolicy.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile youthpolicy.html head: title="청소년 보호정책"(공백 verbatim), description/keywords 빈값. */
export const metadata: Metadata = {
  title: "청소년 보호정책",
  description: "",
  keywords: "",
};

export default function MobileServiceYouthpolicyPage() {
  return <MobileServiceYouthpolicyScreen />;
}
