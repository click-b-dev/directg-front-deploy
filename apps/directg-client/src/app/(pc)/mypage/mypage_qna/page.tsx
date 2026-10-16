import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageQna } from "@entities/mypage-qna/api/get-mypage-qna";
import { MypageQnaScreen } from "@screens/mypage-qna";

/** legacy `pc/mypage/mypage_qna.html` head. title="문의 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "문의 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_qna.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MypageQnaPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const data = await getMypageQna(page);
  return <MypageQnaScreen data={data} />;
}
