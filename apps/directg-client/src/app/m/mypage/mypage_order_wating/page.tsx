import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageOrdersWaiting } from "@entities/mypage-order/api/get-mypage-orders-waiting";
import {
  MobileMypageOrderWaitingScreen,
  flattenWaitingOrders,
} from "@screens/mobile-mypage-order-waiting";

/** legacy mobile mypage_order_wating.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_order_wating.html head: title="주문완료 내역"(입금대기 화면 quirk), description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주문완료 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageOrderWaitingPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list, totalPages } = await getMypageOrdersWaiting(1);
  return (
    <MobileMypageOrderWaitingScreen list={flattenWaitingOrders(list)} totalPages={totalPages} />
  );
}
