import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getSnsLoginConnections } from "@entities/mypage-sns-login/api/get-sns-login-connections";
import { MobileMypageSnsLoginConnectScreen } from "@screens/mobile-mypage-sns-login-connect";

/** legacy mobile sns_login_connect.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile sns_login_connect.html head: title="간편로그인 연결", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "간편로그인 연결",
  description: "",
  keywords: "",
};

/** legacy `<body class="bg-white ...">` — 흰 배경 재현(`/m/layout`이 body dark-mode-active 소유). */
const PAGE_STYLE = `body{background-color:#fff !important;}`;

export default async function MobileMypageSnsLoginConnectPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list } = await getSnsLoginConnections();
  return (
    <>
      <style>{PAGE_STYLE}</style>
      <MobileMypageSnsLoginConnectScreen connections={list} />
    </>
  );
}
