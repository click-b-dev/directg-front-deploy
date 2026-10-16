import type { Metadata, Viewport } from "next";

import { getBoardDataroom } from "@entities/board-dataroom";
import { BoardDataroomScreen } from "@screens/board-dataroom";

/** legacy `pc/board/dataroom.html` head. title="자료실", 빈 description, author=H2interactive, favicon. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "자료실",
  description: "",
  authors: [{ name: "H2interactive" }],
  icons: { shortcut: "/favicon.ico" },
};

/** legacy dataroom.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function BoardDataroomPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1
  const data = await getBoardDataroom(page);
  return <BoardDataroomScreen data={data} />;
}
