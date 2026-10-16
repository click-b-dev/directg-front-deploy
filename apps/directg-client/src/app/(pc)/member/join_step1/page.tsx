import type { Metadata, Viewport } from "next";

import { MemberJoinStep1Screen } from "@screens/member-join-step1";

/** legacy `pc/member/join_step1.html` head. title="가입방법 선택", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "가입방법 선택",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy join_step1.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function MemberJoinStep1Page() {
  return <MemberJoinStep1Screen />;
}
