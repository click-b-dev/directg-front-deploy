import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageGift } from "@entities/mypage-gift/api/get-mypage-gift";
import { MypageGiftScreen } from "@screens/mypage-gift";

/** legacy `pc/mypage/mypage_gift.html` head. title="사은품 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "사은품 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_gift.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MypageGiftPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const data = await getMypageGift(page);
  return <MypageGiftScreen data={data} />;
}
