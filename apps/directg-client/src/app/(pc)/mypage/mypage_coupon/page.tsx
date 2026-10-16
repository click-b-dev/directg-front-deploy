import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageCoupons } from "@entities/mypage-coupon/api/get-mypage-coupons";
import { MypageCouponScreen } from "@screens/mypage-coupon";

/** legacy `pc/mypage/mypage_coupon.html` head. title="쿠폰 내역", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "쿠폰 내역",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_coupon.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function MypageCouponPage({ searchParams }: { searchParams: SearchParams }) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1;
  const data = await getMypageCoupons(page);
  return <MypageCouponScreen data={data} />;
}
