import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMemberAccount } from "@entities/mypage-account/api/get-member-account";
import { getMypageWishlist } from "@entities/mypage-wishlist/api/get-mypage-wishlist";
import { MobileMypageWishlistScreen, computeMemberAge } from "@screens/mobile-mypage-wishlist";

/** legacy mobile mypage_wishlist.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_wishlist.html head: title="위시리스트 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "위시리스트 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageWishlistPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const [account, { list }] = await Promise.all([getMemberAccount(), getMypageWishlist(1)]);
  const age = computeMemberAge(account.birth_day, account.is_auth);
  return <MobileMypageWishlistScreen list={list} age={age} />;
}
