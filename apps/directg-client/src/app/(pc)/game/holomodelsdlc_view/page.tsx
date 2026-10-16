import type { Metadata, Viewport } from "next";

import { getHolomodelsDlcDetail } from "@entities/dlc-detail";
import { GameHolomodelsDlcScreen } from "@screens/game-holomodelsdlc";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy `pc/game/holomodelsdlc_view.html` head. title=product_name(동적) + canonical/alternate/OG. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sku = firstParam((await searchParams).sku);
  const data = await getHolomodelsDlcDetail(sku);
  const d = data.dlc_info;
  const shortDesc = data.goods_description.short_description;
  const canonical = `https://directg.net/game/holomodelsdlc_view?sku=${d.goods_sku}`;
  const ogImage = `${d.domain}/upload/product/${d.product_code}/header/header.jpg`;

  return {
    title: d.product_name,
    description: shortDesc,
    authors: [{ name: "H2interactive" }],
    alternates: {
      canonical,
      media: {
        "only screen and (max-width: 640px)": `https://m.directg.net/game/holomodelsdlc_view?sku=${d.goods_sku}`,
      },
    },
    other: { amazonbot: "noarchive" },
    openGraph: {
      title: d.product_name,
      type: "video.movie",
      url: canonical,
      images: [ogImage],
      description: shortDesc,
      siteName: "다이렉트게임즈",
    },
  };
}

export default async function HolomodelsDlcViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sku = firstParam((await searchParams).sku);
  const data = await getHolomodelsDlcDetail(sku);
  return <GameHolomodelsDlcScreen data={data} />;
}
