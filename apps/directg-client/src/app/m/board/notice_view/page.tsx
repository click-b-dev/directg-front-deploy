import type { Metadata, Viewport } from "next";

import { getBoardNoticeView } from "@entities/board-notice";
import { MobileNoticeViewScreen } from "@screens/mobile-notice-view";

/** legacy mobile notice_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile notice_view.html head: title="공지사항"(고정), description/keywords 빈값. */
export const metadata: Metadata = {
  title: "공지사항",
  description: "",
  keywords: "",
  icons: { icon: { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" } },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MobileNoticeViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const idx = Number(firstParam(sp.idx)) || 0; // legacy: FILTER_SANITIZE_NUMBER_INT

  const data = await getBoardNoticeView(idx);

  return (
    <>
      {/* legacy mobile notice_view.html head 인라인 style (.post-body) */}
      <style>{`.post-body{font-size:14px;}.post-body p{margin-bottom:0px;}.post-body img{padding:16px;}.post-body strong{font-size:16px;margin-bottom:10px;}.post-body li{line-height:150%;}.post-body div{margin-top:20px;margin-bottom:20px;}`}</style>

      <MobileNoticeViewScreen data={data} />
    </>
  );
}
