import type { Metadata, Viewport } from "next";

import { getFm26Status } from "@entities/event/api/get-fm26-status";
import type { Fm26Status } from "@entities/event";
import { getMemberSession } from "@entities/member-auth/api/get-member-session";
import { MobileEventFm26Screen } from "@screens/mobile-event-fm26";

/** legacy mobile event_fm26.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile event_fm26.html head. */
export const metadata: Metadata = {
  title: "풋볼 매니저 26 예약구매 이벤트",
  description:
    "이벤트 내용: #01 <풋볼 매니저 2024> 구매 회원 한정 추가 혜택 이벤트,#02 <풋볼 매니저 26> 사전 액세스 플레이 인증 이벤트,이벤트 기간: 2025년 11월 5일(수)까지,사은품 지급: 이벤트 페이지에서 실시간 수령",
  keywords: "",
  alternates: {
    canonical: "https://directg.net/event/event_fm26",
  },
};

export default async function MobileEventFm26Page() {
  const member = await getMemberSession();
  let status: Fm26Status | null = null;
  if (member) {
    status = await getFm26Status();
  }

  return <MobileEventFm26Screen member={member} status={status} />;
}
