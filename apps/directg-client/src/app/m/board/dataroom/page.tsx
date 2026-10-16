import type { Metadata, Viewport } from "next";

import { MobileDataroomScreen } from "@screens/mobile-dataroom";

/** legacy mobile dataroom.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile dataroom.html head: title="자료실", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "자료실",
  description: "",
  keywords: "",
};

/** legacy mobile dataroom.html head 인라인 style (appCapsuleSub padding + pc-only 카드). */
const PC_ONLY_STYLE = `#appCapsuleSub{padding-top:56px;}.pc-only-container{display:flex;align-items:center;justify-content:center;padding:20px;}.pc-only-card{text-align:center;max-width:340px;width:100%;padding:30px 24px;background-color:#1b263b;border-radius:8px;border:1px solid #2c3a52;box-shadow:0 4px 15px rgba(0,0,0,0.3);}.pc-only-card .icon-wrapper{display:inline-flex;align-items:center;justify-content:center;width:72px;height:72px;background-color:#243048;border-radius:50%;margin-bottom:20px;}.pc-only-card .icon-wrapper svg path{fill:#8a99ad;}.pc-only-card .pc-only-title{font-size:18px;margin-bottom:10px;letter-spacing:-0.5px;}.pc-only-card .pc-only-desc{font-size:13px;color:#8a99ad;line-height:1.5;margin-bottom:24px;word-break:keep-all;}`;

export default function MobileDataroomPage() {
  return (
    <>
      <style>{PC_ONLY_STYLE}</style>
      <MobileDataroomScreen />
    </>
  );
}
