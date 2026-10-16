import type { Metadata, Viewport } from "next";

import { getMypageRetailOrderView } from "@entities/mypage-order/api/get-mypage-retail-order-view";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageRetailOrderViewScreen } from "@screens/mypage-retail-order-view";

/** legacy `pc/mypage/mypage_retail_order_view.html` head. title="주문 내역"(상세이나 목록과 동일 문구), 빈 description, author=H2interactive. */
export const metadata: Metadata = {
  title: "주문 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_retail_order_view.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MypageRetailOrderViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드 (단 데이터 m_no는 하드코딩 — 백엔드)
  const sp = await searchParams;
  const settleNo = firstParam(sp.settle_no);

  const data = await getMypageRetailOrderView(settleNo);

  return <MypageRetailOrderViewScreen data={data} />;
}
