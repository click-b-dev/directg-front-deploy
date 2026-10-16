import type { Metadata, Viewport } from "next";

import { getMypageOrdersWaiting } from "@entities/mypage-order/api/get-mypage-orders-waiting";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageOrderWaitingScreen } from "@screens/mypage-order-waiting";

/** legacy `pc/mypage/mypage_order_wating.html` head. title="입금대기 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "입금대기 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_order_wating.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MypageOrderWaitingPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;

  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const searchProductName = firstParam(sp.search_product_name);
  const searchDateParam = firstParam(sp.search_date); // raw(""=미지정) — 페이지네이션 param용
  const searchDate = searchDateParam || "0"; // legacy: empty → "0"(최근 6개월)

  const data = await getMypageOrdersWaiting(page, searchProductName || undefined, searchDate);

  return (
    <MypageOrderWaitingScreen
      data={data}
      searchProductName={searchProductName}
      searchDateParam={searchDateParam}
    />
  );
}
