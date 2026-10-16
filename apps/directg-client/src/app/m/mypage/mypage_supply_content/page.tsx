import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileMypageSupplyContentScreen } from "@screens/mobile-mypage-supply-content";

/** legacy mobile mypage_supply_content.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_supply_content.html head: title="제공컨텐츠", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "제공컨텐츠",
  description: "",
  keywords: "",
};

export default async function MobileMypageSupplyContentPage() {
  await requireMemberSession(); // legacy login_check.php 가드 (콘텐츠는 정적, 데이터 조회 없음)
  return <MobileMypageSupplyContentScreen />;
}
