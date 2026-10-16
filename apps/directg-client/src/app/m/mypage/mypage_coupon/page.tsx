import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageCoupons } from "@entities/mypage-coupon/api/get-mypage-coupons";
import { MobileMypageCouponScreen } from "@screens/mobile-mypage-coupon";

/** legacy mobile mypage_coupon.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_coupon.html head: title="쿠폰 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "쿠폰 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageCouponPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const data = await getMypageCoupons(1);
  return <MobileMypageCouponScreen data={data} />;
}
