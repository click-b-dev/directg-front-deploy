import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { MobileMemberJoinStep2Screen } from "@screens/mobile-member-join-step2";

/** legacy mobile join_step2.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile join_step2.html head: title="회원가입", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "회원가입",
  description: "",
  keywords: "",
};

/** legacy는 `conf/agreement_20250701.txt`(= public 복사분 agreement_250701.txt)를 textarea에 include. 서버에서 읽어 전달. */
async function readAgreement(): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "service", "agreement_250701.txt");
  return readFile(filePath, "utf-8");
}

/** legacy는 bottom_menu 미포함 → `/m/layout` 전역 하단바를 숨겨 시각 parity 유지(공유 레이아웃 무수정). */
const PAGE_STYLE = `.appBottomMenu{display:none !important;}`;

export default async function MobileMemberJoinStep2Page() {
  const agreementText = await readAgreement();
  return (
    <>
      <style>{PAGE_STYLE}</style>
      <MobileMemberJoinStep2Screen agreementText={agreementText} />
    </>
  );
}
