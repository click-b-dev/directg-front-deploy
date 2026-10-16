import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageMemberLevelInfoScreen } from "@screens/mypage-member-level-info";

/** legacy `pc/mypage/member_level_info.html` head. title="회원등급 안내", 빈 description/keywords, author 없음. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "회원등급 안내",
  description: "",
  keywords: "",
};

/** legacy는 `width=device-width, initial-scale=1, shrink-to-fit=no`(shrink-to-fit=no는 deprecated·무시 → 생략). */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function MypageMemberLevelInfoPage() {
  await requireMemberSession(); // legacy login_check.php — 비로그인 시 login.html redirect
  return <MypageMemberLevelInfoScreen />;
}
