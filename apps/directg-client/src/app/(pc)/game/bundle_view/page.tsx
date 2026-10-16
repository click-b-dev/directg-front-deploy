import type { Metadata, Viewport } from "next";

import { getBundleDetail } from "@entities/bundle-detail";
import { GameBundleScreen } from "@screens/game-bundle";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/**
 * legacy `pc/game/bundle_view.html` head. title=product_name(동적), description="", author="다이렉트 게임즈",
 * amazonbot noarchive, canonical(goods_sku)/alternate/OG(type=website, url=raw sku). GA4·JSON-LD 없음.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sku = firstParam((await searchParams).sku);
  const data = await getBundleDetail(sku);
  const g = data.goods_item;
  const canonical = `https://directg.net/game/bundle_view?sku=${g.goods_sku}`;
  const ogImage = `${g.domain}/upload/product/${g.product_code}/header/header.jpg`;

  return {
    title: g.product_name,
    description: "",
    authors: [{ name: "다이렉트 게임즈" }],
    alternates: {
      canonical,
      media: {
        "only screen and (max-width: 640px)": `https://m.directg.net/game/bundle_view?sku=${g.goods_sku}`,
      },
    },
    other: { amazonbot: "noarchive" },
    openGraph: {
      title: g.product_name,
      type: "website",
      url: `https://directg.net/game/bundle_view?sku=${sku}`,
      images: [{ url: ogImage, type: "image/jpeg", alt: g.product_name }],
      locale: "ko_KR",
      siteName: "다이렉트 게임즈",
    },
  };
}

export default async function BundleViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sku = firstParam((await searchParams).sku);
  const data = await getBundleDetail(sku);
  return <GameBundleScreen data={data} />;
}
