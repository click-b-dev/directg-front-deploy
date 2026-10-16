import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getSettleInit } from "@entities/order/api/get-settle-init";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileOrderSettleScreen, type MobileSettleQuery } from "@screens/mobile-order-settle";

/** legacy mobile order/settle.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile order/settle.html head: title="결제하기", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "결제하기",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));

// legacy: 모바일 order.html native POST → App Router GET 전환(승인). searchParams로 수신.
export default async function MobileOrderSettlePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const query: MobileSettleQuery = {
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
  return <MobileOrderSettleScreen query={query} init={init} />;
}
