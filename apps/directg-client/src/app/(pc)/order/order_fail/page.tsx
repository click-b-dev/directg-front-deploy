import type { Metadata, Viewport } from "next";

import { OrderFailScreen } from "@screens/order-fail";

/** legacy `pc/order/order_fail.html` head. title="주문실패", 빈 description/author, canonical/OG 없음. */
export const metadata: Metadata = {
  title: "주문실패",
  description: "",
  authors: [{ name: "" }],
};

/** legacy order_fail.html: width=device-width, initial-scale=1.0. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// legacy: login_check 없음(public). msg/message 쿼리만 표시. aspOrderNum·Order 객체는 미사용 cruft.
export default async function OrderFailPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pick = (v: string | string[] | undefined) => (Array.isArray(v) ? (v[0] ?? "") : (v ?? ""));
  return <OrderFailScreen msg={pick(sp.msg)} message={pick(sp.message)} />;
}
