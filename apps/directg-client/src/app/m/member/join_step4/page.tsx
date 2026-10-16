import type { Metadata, Viewport } from "next";

import { MobileMemberJoinStep4Screen } from "@screens/mobile-member-join-step4";

/** legacy mobile join_step4.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile join_step4.html head: title="회원가입", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "회원가입",
  description: "",
  keywords: "",
};

/** legacy는 bottom_menu 미포함 → `/m/layout` 전역 하단바를 숨겨 시각 parity 유지(공유 레이아웃 무수정). */
const PAGE_STYLE = `.appBottomMenu{display:none !important;}`;

export default function MobileMemberJoinStep4Page() {
  return (
    <>
      <style>{PAGE_STYLE}</style>
      <MobileMemberJoinStep4Screen />
    </>
  );
}
