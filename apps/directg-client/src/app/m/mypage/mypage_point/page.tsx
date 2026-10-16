import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypagePoints } from "@entities/mypage-point";
import { MobileMypagePointScreen } from "@screens/mobile-mypage-point";

/** legacy mobile mypage_point.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_point.html head: title="포인트 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "포인트 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypagePointPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const data = await getMypagePoints(1);
  return <MobileMypagePointScreen data={data} />;
}
