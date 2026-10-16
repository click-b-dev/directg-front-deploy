import type { Metadata, Viewport } from "next";

import { getOrderComplete } from "@entities/order/api/get-order-complete";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { OrderEndScreen } from "@screens/order-end";

/** legacy `pc/order/order_end.html` head. title="주문완료", 빈 description/author, canonical/OG 없음. */
export const metadata: Metadata = {
  title: "주문완료",
  description: "",
  authors: [{ name: "" }],
};

/** legacy order_end.html: width=device-width, initial-scale=1.0. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function OrderEndPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const settleNo = Array.isArray(sp.settle_no) ? sp.settle_no[0] : (sp.settle_no ?? "");
  const data = await getOrderComplete(settleNo);
  return <OrderEndScreen data={data} />;
}
