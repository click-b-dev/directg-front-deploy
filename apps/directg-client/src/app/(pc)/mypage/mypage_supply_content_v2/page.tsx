import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getSupplyContent } from "@entities/mypage-supply-content/api/get-supply-content";
import { MypageSupplyContentScreen } from "@screens/mypage-supply-content";

/**
 * legacy `pc/mypage/mypage_supply_content_v2.html` head. title="제공콘텐츠", description/keywords 빈값,
 * author 메타 없음. canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "제공콘텐츠",
  description: "",
  keywords: "",
};

/** legacy는 `width=device-width, initial-scale=1, shrink-to-fit=no`(shrink-to-fit은 Next 미표현 no-op 드롭). */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function MypageSupplyContentPage() {
  const session = await requireMemberSession(); // legacy login_check.php 가드
  const data = await getSupplyContent();
  return <MypageSupplyContentScreen data={data} memberId={session.m_id} />;
}
