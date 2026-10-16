import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileMypageMemberLevelInfoScreen } from "@screens/mobile-mypage-member-level-info";

/** legacy mobile member_level_info.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile member_level_info.html head: title="회원등급 안내", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "회원등급 안내",
  description: "",
  keywords: "",
};

export default async function MobileMypageMemberLevelInfoPage() {
  await requireMemberSession(); // legacy login_check.php 가드(데이터 조회 없음)
  return <MobileMypageMemberLevelInfoScreen />;
}
