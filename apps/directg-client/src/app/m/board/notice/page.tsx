import type { Metadata, Viewport } from "next";

import { getBoardNotices } from "@entities/board-notice";
import { MobileNoticeListScreen } from "@screens/mobile-notice-list";

/** legacy mobile notice.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile notice.html head: title="공지사항", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "공지사항",
  description: "",
  keywords: "",
  icons: { icon: { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" } },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MobileNoticePage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getBoardNotices(page);

  return <MobileNoticeListScreen data={data} />;
}
