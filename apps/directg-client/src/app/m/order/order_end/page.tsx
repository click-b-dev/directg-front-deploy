import type { Metadata, Viewport } from "next";

import { getOrderComplete } from "@entities/order/api/get-order-complete";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileOrderEndScreen } from "@screens/mobile-order-end";

/** legacy mobile order/order_end.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile order/order_end.html head: title="주문완료", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주문완료",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MobileOrderEndPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const settleNo = Array.isArray(sp.settle_no) ? sp.settle_no[0] : (sp.settle_no ?? "");
  const data = await getOrderComplete(settleNo);
  return <MobileOrderEndScreen data={data} />;
}
