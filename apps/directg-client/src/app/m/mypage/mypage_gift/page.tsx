import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageGift } from "@entities/mypage-gift/api/get-mypage-gift";
import { MobileMypageGiftScreen } from "@screens/mobile-mypage-gift";

/** legacy mobile mypage_gift.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_gift.html head: title="사은품 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "사은품 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageGiftPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list } = await getMypageGift(1);
  return <MobileMypageGiftScreen list={list} />;
}
