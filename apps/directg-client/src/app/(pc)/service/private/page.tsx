import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { ServicePrivateScreen } from "@screens/service-private";

/** legacy `pc/service/private.html` head. title="개인정보처리방침", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy private.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** legacy `$old_dates` — 이전 방침 버전 (필요시 추가). */
const OLD_DATES = ["250701"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** legacy는 `<pre>`에 txt를 PHP include로 SSR inline. 서버에서 파일을 읽어 그대로 전달. */
function readServiceText(file: string): Promise<string> {
  return readFile(path.join(process.cwd(), "public", "service", file), "utf-8");
}

export default async function ServicePrivatePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const date = (Array.isArray(sp.date) ? sp.date[0] : sp.date) ?? "";

  // legacy: date가 $old_dates에 있고 파일이 존재하면 이전 버전, 아니면 현행 fallback.
  let documentHtml: string;
  let isOld = false;
  if (date && OLD_DATES.includes(date)) {
    try {
      documentHtml = await readServiceText(`private_${date}.txt`);
      isOld = true;
    } catch {
      documentHtml = await readServiceText("private.txt");
    }
  } else {
    documentHtml = await readServiceText("private.txt");
  }

  return <ServicePrivateScreen documentHtml={documentHtml} isOld={isOld} oldDates={OLD_DATES} />;
}
