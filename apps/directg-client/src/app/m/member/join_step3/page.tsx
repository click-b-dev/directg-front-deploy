import type { Metadata, Viewport } from "next";

import { MobileMemberJoinStep3Screen } from "@screens/mobile-member-join-step3";

/** legacy mobile join_step3.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile join_step3.html head: title="회원가입", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "회원가입",
  description: "",
  keywords: "",
};

/**
 * legacy는 서버가 POST(is_private/is_agreement)를 받아 가드하나, 모바일 join은 client-state(dg_mobile_join) 전달이라
 * 가드는 screen(client)에서 수행. bottom_menu 미포함 → 하단바 숨김.
 */
const PAGE_STYLE = `.appBottomMenu{display:none !important;}`;

export default function MobileMemberJoinStep3Page() {
  return (
    <>
      <style>{PAGE_STYLE}</style>
      <MobileMemberJoinStep3Screen />
    </>
  );
}
