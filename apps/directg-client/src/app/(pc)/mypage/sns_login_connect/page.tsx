import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getSnsLoginConnections } from "@entities/mypage-sns-login/api/get-sns-login-connections";
import { MypageSnsLoginConnectScreen } from "@screens/mypage-sns-login-connect";

/**
 * legacy `pc/mypage/sns_login_connect.html` head. title="간편로그인 연결",
 * description/keywords 빈값, author/canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "간편로그인 연결",
  description: "",
  keywords: "",
};

/** legacy는 `width=device-width, initial-scale=1, shrink-to-fit=no`(shrink-to-fit은 Next 미표현 no-op 드롭). */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function MypageSnsLoginConnectPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const data = await getSnsLoginConnections();
  return <MypageSnsLoginConnectScreen list={data.list} />;
}
