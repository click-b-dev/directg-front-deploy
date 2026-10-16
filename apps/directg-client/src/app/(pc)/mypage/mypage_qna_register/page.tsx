import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MypageQnaRegisterScreen } from "@screens/mypage-qna-register";

/** legacy `pc/mypage/mypage_qna_register.html` head. title="문의 하기", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "문의 하기",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy mypage_qna_register.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function MypageQnaRegisterPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  return <MypageQnaRegisterScreen />;
}
