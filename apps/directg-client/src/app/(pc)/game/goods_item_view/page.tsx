import type { Metadata, Viewport } from "next";
import Script from "next/script";

import { getGoodsItemDetail } from "@entities/goods-item-detail";
import { GameGoodsItemScreen } from "@screens/game-goods-item";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * legacy `pc/game/goods_item_view.html` head. title=title_name(동적), description="", author=H2interactive,
 * OG(type=video.movie, url=game_view?title_id=, image=title header, description=""). canonical/alternate/amazonbot 없음.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const data = await getGoodsItemDetail(firstParam(sp.product_id), firstParam(sp.sku));
  const t = data.title_info;
  const ogImage = `https://directg.net/upload/title/${t.title_id}/header/${t.title_id}.jpg`;

  return {
    title: t.title_name,
    description: "",
    authors: [{ name: "H2interactive" }],
    openGraph: {
      title: t.title_name,
      type: "video.movie",
      url: `http://directg.net/game/game_view?title_id=${t.title_id}`,
      images: [ogImage],
      description: "",
      siteName: "다이렉트게임즈",
    },
  };
}

export default async function GoodsItemViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const data = await getGoodsItemDetail(firstParam(sp.product_id), firstParam(sp.sku));

  return (
    <>
      {/* legacy 인라인 GA4 view_item — $ga4 미정의로 items:null(원본 동작 그대로). gtag 베이스는 (pc)/layout. */}
      {data.goods_status === "Y" && (
        <Script id="ga4-view-item" strategy="afterInteractive">
          {`gtag("event","view_item",{currency:"KRW",items:null});`}
        </Script>
      )}
      <GameGoodsItemScreen data={data} />
    </>
  );
}
