import type { Metadata, Viewport } from "next";

import { getMypageCancelRequests } from "@entities/mypage-order/api/get-mypage-cancel-requests";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageCancelRequestScreen } from "@screens/mypage-cancel-request";

/** legacy `pc/mypage/mypage_cancel_request.html` head. title="취소요청 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "취소요청 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_cancel_request.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MypageCancelRequestPage({
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

  const data = await getMypageCancelRequests(page, searchProductName || undefined, searchDate);

  return (
    <MypageCancelRequestScreen
      data={data}
      searchProductName={searchProductName}
      searchDateParam={searchDateParam}
    />
  );
}
