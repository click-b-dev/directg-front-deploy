import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageDashboard } from "@entities/mypage-dashboard";
import { MobileMypageMainScreen } from "@screens/mobile-mypage-main";

/** legacy mobile mypage_main.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_main.html head: title="마이페이지", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "마이페이지",
  description: "",
  keywords: "",
};

export default async function MobileMypageMainPage() {
  const member = await requireMemberSession(); // legacy login_check.php 가드 + 세션 name
  const dashboard = await getMypageDashboard();
  return <MobileMypageMainScreen memberName={member.name} dashboard={dashboard} />;
}
