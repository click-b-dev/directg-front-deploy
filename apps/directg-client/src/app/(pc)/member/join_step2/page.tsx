import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { MemberJoinStep2Screen } from "@screens/member-join-step2";

/** legacy `pc/member/join_step2.html` head. title="약관동의", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "약관동의",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy join_step2.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** legacy는 `<pre>`에 `agreement.txt`를 PHP include로 SSR inline. 서버에서 파일을 읽어 그대로 전달. */
async function readAgreement(): Promise<string> {
  const filePath = path.join(process.cwd(), "public", "service", "agreement.txt");
  return readFile(filePath, "utf-8");
}

export default async function MemberJoinStep2Page() {
  const agreementHtml = await readAgreement();
  return <MemberJoinStep2Screen agreementHtml={agreementHtml} />;
}
