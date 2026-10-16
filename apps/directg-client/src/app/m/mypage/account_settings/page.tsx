import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMemberAccount } from "@entities/mypage-account/api/get-member-account";
import { MobileMypageAccountSettingsScreen } from "@screens/mobile-mypage-account-settings";

/** legacy mobile account_settings.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile account_settings.html head: title="계정 설정", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "계정 설정",
  description: "",
  keywords: "",
};

export default async function MobileMypageAccountSettingsPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const account = await getMemberAccount();
  return <MobileMypageAccountSettingsScreen account={account} />;
}
