import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileMypageQnaRegisterScreen } from "@screens/mobile-mypage-qna-register";

/** legacy mobile mypage_qna_register.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_qna_register.html head: title="문의 하기", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "문의 하기",
  description: "",
  keywords: "",
};

export default async function MobileMypageQnaRegisterPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  return <MobileMypageQnaRegisterScreen />;
}
