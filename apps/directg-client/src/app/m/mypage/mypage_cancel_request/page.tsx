import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageCancelRequests } from "@entities/mypage-order/api/get-mypage-cancel-requests";
import { MobileMypageCancelRequestScreen } from "@screens/mobile-mypage-cancel-request";

/** legacy mobile mypage_cancel_request.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_cancel_request.html head: title="취소 요청 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "취소 요청 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageCancelRequestPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list } = await getMypageCancelRequests(1);
  return <MobileMypageCancelRequestScreen list={list} />;
}
