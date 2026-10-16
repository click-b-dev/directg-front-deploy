import type { Metadata, Viewport } from "next";

import { getBoardFaqs } from "@entities/board-faq";
import { MobileFaqScreen } from "@screens/mobile-faq";

/** legacy mobile faq.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile faq.html head: title="자주묻는 질문", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "자주묻는 질문",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MobileFaqPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Number(firstParam(sp.page)) > 0 ? Number(firstParam(sp.page)) : 1; // legacy: empty → 1
  const searchValue = firstParam(sp.searchValue);

  const data = await getBoardFaqs(page, searchValue || undefined);

  return (
    <>
      {/* legacy mobile faq.html head 인라인 style */}
      <style>{`#appCapsuleSub{padding-top:56px;}`}</style>

      <MobileFaqScreen data={data} searchValue={searchValue} />
    </>
  );
}
