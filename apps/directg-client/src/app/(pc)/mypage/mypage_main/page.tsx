import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageDashboard } from "@entities/mypage-dashboard";
import { MypageMainScreen } from "@screens/mypage-main";

/** legacy `pc/mypage/mypage_main.html` head. title="마이페이지", 빈 description/author. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "마이페이지",
  description: "",
  authors: [{ name: "" }],
};

/** legacy mypage_main.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function MypageMainPage() {
  const member = await requireMemberSession(); // legacy login_check.php 가드 + 세션(name/level)
  const dashboard = await getMypageDashboard();
  return (
    <MypageMainScreen memberName={member.name} memLevel={member.mem_level} dashboard={dashboard} />
  );
}
