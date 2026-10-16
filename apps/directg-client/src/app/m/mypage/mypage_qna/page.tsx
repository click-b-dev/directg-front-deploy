import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMypageQna } from "@entities/mypage-qna/api/get-mypage-qna";
import { MobileMypageQnaScreen } from "@screens/mobile-mypage-qna";

/** legacy mobile mypage_qna.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile mypage_qna.html head: title="문의 내역", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "문의 내역",
  description: "",
  keywords: "",
};

export default async function MobileMypageQnaPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list, totalPages } = await getMypageQna(1);
  return <MobileMypageQnaScreen list={list} totalPages={totalPages} />;
}
