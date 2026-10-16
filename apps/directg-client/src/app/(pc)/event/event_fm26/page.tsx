import type { Metadata, Viewport } from "next";

import { getFm26Status } from "@entities/event/api/get-fm26-status";
import type { Fm26Status } from "@entities/event";
import { getMemberSession } from "@entities/member-auth/api/get-member-session";
import { EventFm26Screen } from "@screens/event-fm26";

/** legacy `pc/event/event_fm26.html` head. title/canonical/alternate(모바일). description 빈값, author=H2interactive. */
export const metadata: Metadata = {
  title: "풋볼 매니저 26 예약구매 이벤트",
  description: "",
  authors: [{ name: "H2interactive" }],
  alternates: {
    canonical: "https://directg.net/event/event_fm26",
    media: {
      "only screen and (max-width: 640px)": "https://m.directg.net/event/event_fm26",
    },
  },
};

/** legacy event_fm26.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function EventFm26Page() {
  // legacy: 공개 페이지(미로그인 열람 가능). 로그인 시에만 이벤트#01 상태조회.
  const member = await getMemberSession();
  let status: Fm26Status | null = null;
  if (member) {
    status = await getFm26Status();
  }

  return <EventFm26Screen member={member} status={status} />;
}
