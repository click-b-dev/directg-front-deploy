import type { Metadata, Viewport } from "next";
import { permanentRedirect } from "next/navigation";
import Script from "next/script";

import { getGameDetail } from "@entities/game-detail";
import { GameDetailScreen } from "@screens/game-detail";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy 하드코딩 301 리다이렉트 대상 product_id. */
const REDIRECT_PRODUCT_ID = "b94b13ed-10c0-465d-9344-5aa5a5ff8cd2";
const REDIRECT_TARGET =
  "/game/goods_item_view?product_id=b94b13ed-10c0-465d-9344-5aa5a5ff8cd2&sku=82772041-85b0-4a94-b18f-2efcd754cef5&platform=32";

/**
 * legacy `pc/game/game_view.html` head.
 * title=title_name(동적), description=short_description, author=H2interactive,
 * canonical/alternate(모바일)/amazonbot noarchive/OG.
 * (JSON-LD는 legacy에서 전부 주석 처리되어 미출력 → 재현 안 함.)
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);
  if (productId === REDIRECT_PRODUCT_ID) return {};

  const platform = firstParam(sp.platform);
  const data = await getGameDetail(productId, platform);
  const t = data.title_info;
  const shortDesc = data.goods_description.short_description;
  const canonical = `https://directg.net/game/game_view?product_id=${t.sku}`;
  const ogImage = `${t.domain}/upload/title/${t.title_id}/header/${t.title_id}.jpg`;

  return {
    title: t.title_name,
    description: shortDesc,
    authors: [{ name: "H2interactive" }],
    alternates: {
      canonical,
      media: {
        "only screen and (max-width: 640px)": `https://m.directg.net/game/game_view?product_id=${t.sku}`,
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

export default async function GameViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);

  // legacy: 특정 product_id는 301 이동(Next는 permanentRedirect=308).
  if (productId === REDIRECT_PRODUCT_ID) {
    permanentRedirect(REDIRECT_TARGET);
  }

  const sku = firstParam(sp.sku);
  const platform = firstParam(sp.platform);
  const data = await getGameDetail(productId, platform);

  return (
    <>
      {/* legacy GA4 view_item 이벤트(대표상품 상세보기). gtag 베이스는 (pc)/layout이 로드. */}
      {data.goods_status === "Y" && (
        <Script id="ga4-view-item" strategy="afterInteractive">
          {`gtag("event","view_item",{currency:"KRW",items:${JSON.stringify(data.ga4)}});`}
        </Script>
      )}
      <GameDetailScreen data={data} productId={productId} sku={sku} />
    </>
  );
}
