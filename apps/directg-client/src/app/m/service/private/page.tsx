import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { MobileServicePrivateScreen } from "@screens/mobile-service-private";

/** legacy mobile private.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile private.html head: title="개인정보처리방침", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "",
  keywords: "",
};

/** legacy mobile private.html head 인라인 style — pre 줄바꿈/줄간격 (agreement와 동일). */
const PRE_STYLE = `pre{white-space:pre-wrap;white-space:-moz-pre-wrap;white-space:-o-pre-wrap;word-wrap:break-word;line-height:150%;}`;

/** legacy는 `<pre>`에 `pc/service/private.txt`를 PHP include로 SSR inline. 서버에서 파일을 읽어 그대로 전달. */
function readServiceText(file: string): Promise<string> {
  return readFile(path.join(process.cwd(), "public", "service", file), "utf-8");
}

export default async function MobileServicePrivatePage() {
  // legacy 모바일은 PC와 달리 `?date` 버전 스위치 없음 — 항상 현행 private.txt.
  const privateHtml = await readServiceText("private.txt");

  return (
    <>
      <style>{PRE_STYLE}</style>
      <MobileServicePrivateScreen privateHtml={privateHtml} />
    </>
  );
}
