import type { Metadata, Viewport } from "next";

import { MobileMemberFindPasswordResetScreen } from "@screens/mobile-member-find-password-reset";

/** legacy mobile find_password_reset.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile find_password_reset.html head: title="비밀번호 재설정", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "비밀번호 재설정",
  description: "",
  keywords: "",
};

/**
 * legacy `<body class="bg-white ...">` — 흰 배경 재현. + bottom_menu 미포함 → 하단바 숨김.
 * (`/m/layout`이 body에 dark-mode-active를 소유하므로 배경만 흰색으로 덮어쓴다.)
 */
const PAGE_STYLE = `body{background-color:#fff !important;}.appBottomMenu{display:none !important;}`;

export default function MobileMemberFindPasswordResetPage() {
  return (
    <>
      <style>{PAGE_STYLE}</style>
      <MobileMemberFindPasswordResetScreen />
    </>
  );
}
