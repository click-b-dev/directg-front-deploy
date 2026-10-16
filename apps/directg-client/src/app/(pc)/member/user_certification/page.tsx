import type { Metadata, Viewport } from "next";

import { MemberUserCertificationScreen } from "@screens/member-user-certification";

/** legacy `pc/member/user_certification.html` head. title="비밀번호 재설정", 빈 description, author=H2interactive. */
export const metadata: Metadata = {
  title: "비밀번호 재설정",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy user_certification.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function MemberUserCertificationPage() {
  return <MemberUserCertificationScreen />;
}
