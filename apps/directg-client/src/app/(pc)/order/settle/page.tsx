import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getSettleInit } from "@entities/order/api/get-settle-init";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { OrderSettleScreen, type SettleQuery } from "@screens/order-settle";

/** legacy `pc/order/settle.html` head. title="결제하기", 빈 description/author, canonical/OG 없음. */
export const metadata: Metadata = {
  title: "결제하기",
  description: "",
  authors: [{ name: "" }],
};

/** legacy settle.html: width=device-width, initial-scale=1.0. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

// legacy: order.html native POST → App Router GET 전환(승인). searchParams로 수신.
export default async function OrderSettlePage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const query: SettleQuery = {
    settle_kind: pick(sp.settle_kind),
    use_emoney: pick(sp.use_emoney),
    emoney_chk: pick(sp.emoney_chk),
    zipcode: pick(sp.zipcode),
    address: pick(sp.address),
    address2: pick(sp.address2),
    buyr_name: pick(sp.buyr_name),
    buyr_tel2: pick(sp.buyr_tel2),
    msg: pick(sp.msg),
  };
  const init = await getSettleInit({
    settle_kind: query.settle_kind,
    use_emoney: query.use_emoney,
    emoney_chk: query.emoney_chk,
  });
  // legacy: 주문상품 0건 → 강제 장바구니 이동
  if (init.items.length === 0) redirect("/order/cart");
  return <OrderSettleScreen query={query} init={init} />;
}
