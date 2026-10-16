import type { Metadata, Viewport } from "next";

import { MemberFindPasswordResetScreen } from "@screens/member-find-password-reset";

/** legacy `pc/member/find_password_reset.html` head. title="비밀번호 재설정", 빈 description, author=H2interactive. */
export const metadata: Metadata = {
  title: "비밀번호 재설정",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy find_password_reset.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function MemberFindPasswordResetPage() {
  return <MemberFindPasswordResetScreen />;
}
