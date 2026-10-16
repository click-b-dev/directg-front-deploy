import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageCancelEnd } from "@entities/mypage-order/api/get-mypage-cancel-end";
import { MobileMypageCancelEndScreen } from "@screens/mobile-mypage-cancel-end";

/** legacy mobile mypage_cancel_end.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_cancel_end.html head: title="취소 완료 내역"(공백 유지), description/keywords 빈값. */
export const metadata: Metadata = {
  title: "취소 완료 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageCancelEndPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list } = await getMypageCancelEnd(1);
  return <MobileMypageCancelEndScreen list={list} />;
}
