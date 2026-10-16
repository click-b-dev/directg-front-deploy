import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageWishlist } from "@entities/mypage-wishlist/api/get-mypage-wishlist";
import { MypageWishlistScreen } from "@screens/mypage-wishlist";

/** legacy `pc/mypage/mypage_wishlist.html` head. title="위시리스트 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "위시리스트 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_wishlist.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MypageWishlistPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const data = await getMypageWishlist(page);
  return <MypageWishlistScreen data={data} />;
}
