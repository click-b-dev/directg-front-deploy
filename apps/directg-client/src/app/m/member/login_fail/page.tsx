import type { Metadata, Viewport } from "next";

import { MobileMemberLoginFailScreen } from "@screens/mobile-member-login-fail";

/** legacy mobile login_fail.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile login_fail.html head: title="로그인", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "로그인",
  description: "",
  keywords: "",
};

export default function MobileMemberLoginFailPage() {
  return <MobileMemberLoginFailScreen />;
}
