import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMemberAccount } from "@entities/mypage-account/api/get-member-account";
import { MypageAccountSettingsScreen } from "@screens/mypage-account-settings";

/**
 * legacy `pc/mypage/account_settings.html` head. title="계정 설정".
 * description/keywords는 템플릿 잔재지만 parity상 원문 유지. canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "계정 설정",
  description: "Bootstrap e-commerce html template similar to Alibaba",
  keywords: "Online template, shop, theme, template, html, css, bootstrap 4",
};

/** legacy는 `width=device-width, initial-scale=1, shrink-to-fit=no`(shrink-to-fit 생략). */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function MypageAccountSettingsPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const account = await getMemberAccount();
  return <MypageAccountSettingsScreen account={account} />;
}
