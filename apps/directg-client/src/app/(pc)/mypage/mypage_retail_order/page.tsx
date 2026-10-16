import type { Metadata, Viewport } from "next";

import { getMypageRetailOrders } from "@entities/mypage-order/api/get-mypage-retail-orders";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageRetailOrderScreen } from "@screens/mypage-retail-order";

/** legacy `pc/mypage/mypage_retail_order.html` head. title="실물 상품 주문 내역", 빈 description, author=H2interactive. */
export const metadata: Metadata = {
  title: "실물 상품 주문 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_retail_order.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export default async function MypageRetailOrderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;

  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  // legacy 기본값: search_start_date 빈값→-1개월, search_end_date 빈값→오늘.
  const rawStart = firstParam(sp.search_start_date);
  const rawEnd = firstParam(sp.search_end_date);
  const startFallback = new Date();
  startFallback.setMonth(startFallback.getMonth() - 1);
  const searchStartDate = rawStart || ymd(startFallback);
  const searchEndDate = rawEnd || ymd(new Date());

  const data = await getMypageRetailOrders(page, searchStartDate, searchEndDate);

  return (
    <MypageRetailOrderScreen
      data={data}
      searchStartDate={searchStartDate}
      searchEndDate={searchEndDate}
    />
  );
}
