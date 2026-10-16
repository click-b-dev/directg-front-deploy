import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypagePoints } from "@entities/mypage-point";
import { MypagePointScreen } from "@screens/mypage-point";

/** legacy `pc/mypage/mypage_point.html` head. title="포인트 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "포인트 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_point.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MypagePointPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const data = await getMypagePoints(page);
  return <MypagePointScreen data={data} />;
}
