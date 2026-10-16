import type { Metadata, Viewport } from "next";

import { getBoardFaqs } from "@entities/board-faq";
import { BoardFaqScreen } from "@screens/board-faq";

/** legacy `pc/board/faq.html` head. title="자주묻는질문", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "자주묻는질문",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy faq.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BoardFaqPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const searchRaw = Array.isArray(sp.searchValue) ? sp.searchValue[0] : sp.searchValue;
  const searchValue = searchRaw ?? "";

  const data = await getBoardFaqs(page, searchValue);
  return <BoardFaqScreen data={data} searchValue={searchValue} />;
}
