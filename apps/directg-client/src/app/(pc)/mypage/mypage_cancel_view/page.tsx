import type { Metadata, Viewport } from "next";

import { getMypageCancelView } from "@entities/mypage-order/api/get-mypage-cancel-view";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageCancelViewScreen } from "@screens/mypage-cancel-view";

/** legacy `pc/mypage/mypage_cancel_view.html` head. title="취소완료 상세보기", 빈 description, author=H2interactive. */
export const metadata: Metadata = {
  title: "취소완료 상세보기",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_cancel_view.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MypageCancelViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const settleNo = firstParam(sp.settle_no);

  const data = await getMypageCancelView(settleNo);

  return <MypageCancelViewScreen data={data} />;
}
