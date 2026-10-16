import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageOrderView } from "@entities/mypage-order/api/get-mypage-order-view";
import { MobileMypageOrderWaitingViewScreen } from "@screens/mobile-mypage-order-waiting-view";

/** legacy mobile mypage_order_wating_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_order_wating_view.html head: title="주문 내역 상세보기", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주문 내역 상세보기",
  description: "",
  keywords: "",
};

export default async function MobileMypageOrderWaitingViewPage({
  searchParams,
}: {
  searchParams: Promise<{ settle_no?: string }>;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const { settle_no = "" } = await searchParams;
  const data = await getMypageOrderView(settle_no);
  return <MobileMypageOrderWaitingViewScreen data={data} />;
}
