import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageOrders } from "@entities/mypage-order/api/get-mypage-orders";
import { MobileMypageOrderScreen } from "@screens/mobile-mypage-order";

/** legacy mobile mypage_order.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_order.html head: title="주문완료 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주문완료 내역",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (v: string | string[] | undefined): string =>
  Array.isArray(v) ? (v[0] ?? "") : (v ?? "");

export default async function MobileMypageOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const searchGoodsName = first(sp.search_goods_name);
  const data = await getMypageOrders(1, searchGoodsName || undefined);
  return <MobileMypageOrderScreen data={data} searchGoodsName={searchGoodsName} />;
}
