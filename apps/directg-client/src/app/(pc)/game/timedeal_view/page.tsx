import type { Metadata, Viewport } from "next";

import { getTimedealDetail } from "@entities/timedeal-detail";
import { GameTimedealScreen } from "@screens/game-timedeal";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * legacy `pc/game/timedeal_view.html` head. title=product_name(동적), description="", author=H2interactive,
 * OG(type=video.movie, url=상대 game_view?product_id=title.sku, image=legacy `$dlc_info` 미정의 버그로 빈 product_code).
 * canonical/alternate/amazonbot 없음. GA4·JSON-LD 없음.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sku = firstParam((await searchParams).sku);
  const data = await getTimedealDetail(sku);

  return {
    title: data.timedeal_info.product_name,
    description: "",
    authors: [{ name: "H2interactive" }],
    openGraph: {
      title: data.timedeal_info.product_name,
      type: "video.movie",
      url: `/game/game_view?product_id=${data.title_info.sku}`,
      // legacy: `$dlc_info['product_code']` 미정의 → 빈 product_code(버그 그대로 재현)
      images: ["/upload/product//header/header.jpg"],
      description: data.goods_description.short_description,
      siteName: "다이렉트게임즈",
    },
  };
}

export default async function TimedealViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sku = firstParam((await searchParams).sku);
  const data = await getTimedealDetail(sku);
  return <GameTimedealScreen data={data} />;
}
