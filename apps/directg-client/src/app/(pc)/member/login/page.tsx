import type { Metadata, Viewport } from "next";

import { MemberLoginScreen } from "@screens/member-login";

/** legacy `pc/member/login.html` head. title="로그인", 빈 description/author, canonical 있음. OG 없음. */
export const metadata: Metadata = {
  title: "로그인",
  description: "",
  authors: [{ name: "" }],
  alternates: { canonical: "https://directg.net/member/login" },
};

/** legacy login.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function MemberLoginPage() {
  return <MemberLoginScreen />;
}
