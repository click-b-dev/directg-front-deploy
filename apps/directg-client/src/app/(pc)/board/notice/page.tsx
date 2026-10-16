import type { Metadata, Viewport } from "next";

import { getBoardNotices } from "@entities/board-notice";
import { BoardNoticeListScreen } from "@screens/board-notice-list";

/** legacy `pc/board/notice.html` head. title="공지사항", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "공지사항",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy notice.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BoardNoticePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const searchRaw = Array.isArray(sp.searchValue) ? sp.searchValue[0] : sp.searchValue;
  const searchValue = searchRaw ?? "";

  const data = await getBoardNotices(page, searchValue);
  return <BoardNoticeListScreen data={data} searchValue={searchValue} />;
}
