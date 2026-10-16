import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Metadata, Viewport } from "next";

import { ServiceAgreementScreen } from "@screens/service-agreement";

/** legacy `pc/service/agreement.html` head. title="이용약관", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "이용약관",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy agreement.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** legacy `$old_dates` — 이전 약관 버전 (필요시 추가). */
const OLD_DATES = ["250701"];

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** legacy는 `<pre>`에 txt를 PHP include로 SSR inline. 서버에서 파일을 읽어 그대로 전달. */
function readServiceText(file: string): Promise<string> {
  return readFile(path.join(process.cwd(), "public", "service", file), "utf-8");
}

export default async function ServiceAgreementPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const date = (Array.isArray(sp.date) ? sp.date[0] : sp.date) ?? "";

  // legacy: date가 $old_dates에 있고 파일이 존재하면 이전 버전, 아니면 현행 fallback.
  let agreementHtml: string;
  let isOld = false;
  if (date && OLD_DATES.includes(date)) {
    try {
      agreementHtml = await readServiceText(`agreement_${date}.txt`);
      isOld = true;
    } catch {
      agreementHtml = await readServiceText("agreement.txt");
    }
  } else {
    agreementHtml = await readServiceText("agreement.txt");
  }

  return (
    <ServiceAgreementScreen agreementHtml={agreementHtml} isOld={isOld} oldDates={OLD_DATES} />
  );
}
