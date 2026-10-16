import type { Metadata, Viewport } from "next";

import { getBoardNoticeView } from "@entities/board-notice";
import { BoardNoticeViewScreen } from "@screens/board-notice-view";

/** legacy notice_view.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** legacy `filter_input(idx, SANITIZE_NUMBER_INT)`. */
function parseIdx(sp: Record<string, string | string[] | undefined>): number {
  const raw = Array.isArray(sp.idx) ? sp.idx[0] : sp.idx;
  return Number(raw) > 0 ? Number(raw) : 0;
}

/**
 * legacy `pc/board/notice_view.html` head. title="공지사항", description=contents 원문, author=H2interactive.
 * canonical/alternate(모바일)는 idx별 동적. (getBoardNoticeView는 cache()라 page와 조회 공유.)
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const idx = parseIdx(await searchParams);
  const data = await getBoardNoticeView(idx);
  return {
    title: "공지사항",
    description: data.contents,
    authors: [{ name: "H2interactive" }],
    alternates: {
      canonical: `https://directg.net/board/notice_view?idx=${idx}`,
      media: {
        "only screen and (max-width: 640px)": `https://m.directg.net/board/notice_view?idx=${idx}`,
      },
    },
  };
}

export default async function BoardNoticeViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const idx = parseIdx(await searchParams);
  const data = await getBoardNoticeView(idx);
  return <BoardNoticeViewScreen data={data} />;
}
