import type { Metadata, Viewport } from "next";

import { MemberJoinStep5Screen } from "@screens/member-join-step5";

/** legacy `pc/member/join_step5.html` head. title="가입완료", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "가입완료",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy join_step5.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function MemberJoinStep5Page() {
  return <MemberJoinStep5Screen />;
}
