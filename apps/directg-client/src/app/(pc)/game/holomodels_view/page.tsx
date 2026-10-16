import type { Metadata, Viewport } from "next";
import { permanentRedirect } from "next/navigation";
import Script from "next/script";

import { getHolomodelsDetail } from "@entities/game-detail";
import { GameHolomodelsDetailScreen } from "@screens/game-holomodels-detail";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy 하드코딩 301 대상(game_view와 동일). */
const REDIRECT_PRODUCT_ID = "b94b13ed-10c0-465d-9344-5aa5a5ff8cd2";
const REDIRECT_TARGET =
  "/game/goods_item_view?product_id=b94b13ed-10c0-465d-9344-5aa5a5ff8cd2&sku=82772041-85b0-4a94-b18f-2efcd754cef5&platform=32";

/**
 * legacy `pc/game/holomodels_view.html` head. title=title_name(동적), description=short_description,
 * author=H2interactive, canonical/alternate(모바일)/amazonbot/OG. JSON-LD 주석(미출력).
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);
  if (productId === REDIRECT_PRODUCT_ID) return {};

  const data = await getHolomodelsDetail(productId, firstParam(sp.platform));
  const t = data.title_info;
  const shortDesc = data.goods_description.short_description;
  const canonical = `https://directg.net/game/holomodels_view?product_id=${t.sku}`;
  const ogImage = `${t.domain}/upload/title/${t.title_id}/header/${t.title_id}.jpg`;

  return {
    title: t.title_name,
    description: shortDesc,
    authors: [{ name: "H2interactive" }],
    alternates: {
      canonical,
      media: {
        "only screen and (max-width: 640px)": `https://m.directg.net/game/holomodels_view?product_id=${t.sku}`,
      },
    },
    other: { amazonbot: "noarchive" },
    openGraph: {
      title: t.title_name,
      type: "video.movie",
      url: canonical,
      images: [ogImage],
      description: shortDesc,
      siteName: "다이렉트게임즈",
    },
  };
}

export default async function HolomodelsViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);
  if (productId === REDIRECT_PRODUCT_ID) {
    permanentRedirect(REDIRECT_TARGET);
  }

  const sku = firstParam(sp.sku);
  const data = await getHolomodelsDetail(productId, firstParam(sp.platform));

  return (
    <>
      {data.goods_status === "Y" && (
        <Script id="ga4-view-item" strategy="afterInteractive">
          {`gtag("event","view_item",{currency:"KRW",items:${JSON.stringify(data.ga4)}});`}
        </Script>
      )}
      <GameHolomodelsDetailScreen data={data} productId={productId} sku={sku} />
    </>
  );
}
