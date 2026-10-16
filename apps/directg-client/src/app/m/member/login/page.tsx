import type { Metadata, Viewport } from "next";

import { MobileMemberLoginScreen } from "@screens/mobile-member-login";

/** legacy mobile login.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile login.html head: title="로그인", canonical `directg.net`(m 아님 — legacy quirk). */
export const metadata: Metadata = {
  title: "로그인",
  description: "",
  keywords: "",
  alternates: { canonical: "https://directg.net/member/login" },
};

export default function MobileMemberLoginPage() {
  return <MobileMemberLoginScreen />;
}
