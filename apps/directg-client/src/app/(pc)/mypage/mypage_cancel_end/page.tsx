import type { Metadata, Viewport } from "next";

import { getMypageCancelEnd } from "@entities/mypage-order/api/get-mypage-cancel-end";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageCancelEndScreen } from "@screens/mypage-cancel-end";

/** legacy `pc/mypage/mypage_cancel_end.html` head. title="취소완료 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "취소완료 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_cancel_end.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MypageCancelEndPage({
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

  // legacy: search_date/search_product_name은 where 미적용(dead) — 페이지네이션 param 유지용으로만 전달.
  const data = await getMypageCancelEnd(
    page,
    searchProductName || undefined,
    searchDateParam || undefined,
  );

  return (
    <MypageCancelEndScreen
      data={data}
      searchProductName={searchProductName}
      searchDateParam={searchDateParam}
    />
  );
}
