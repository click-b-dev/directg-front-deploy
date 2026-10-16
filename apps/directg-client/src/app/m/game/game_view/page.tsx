import type { Metadata, Viewport } from "next";
import { permanentRedirect } from "next/navigation";
import Script from "next/script";

import { getGameDetail } from "@entities/game-detail";
import { MobileGameViewScreen } from "@screens/mobile-game-view";

/** legacy mobile game_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** legacy 하드코딩 301 리다이렉트 대상 product_id (PC와 동일 대상). */
const REDIRECT_PRODUCT_ID = "b94b13ed-10c0-465d-9344-5aa5a5ff8cd2";
const REDIRECT_TARGET =
  "/game/goods_item_view?product_id=b94b13ed-10c0-465d-9344-5aa5a5ff8cd2&sku=82772041-85b0-4a94-b18f-2efcd754cef5&platform=32";

/**
 * legacy `mobile/game/game_view.html` head — PC보다 단순.
 * title=title_name, description=short_description, keywords="", canonical(directg.net), favicon, manifest.
 * (OG/alternate/amazonbot/author·JSON-LD 없음.)
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

  return {
    title: t.title_name,
    description: data.goods_description.short_description,
    keywords: "",
    alternates: { canonical: `https://directg.net/game/game_view?product_id=${t.sku}` },
    icons: { icon: { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" } },
    manifest: "/manifest.json",
  };
}

export default async function MobileGameViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);

  // legacy: 특정 product_id는 301 이동(Next permanentRedirect=308).
  if (productId === REDIRECT_PRODUCT_ID) {
    permanentRedirect(REDIRECT_TARGET);
  }

  const sku = firstParam(sp.sku);
  const platform = firstParam(sp.platform);
  const data = await getGameDetail(productId, platform);

  return (
    <>
      {/* legacy mobile game_view.html head 인라인 style (goods_detail_info/nav-pills/event_contents) */}
      <style>{`.nav-pills .nav-link.active{background:#464f5b;}.goods_detail_info{font-size:12px;}.goods_detail_info p{font-size:12px;}.goods_detail_info img{max-width:100%;height:auto;}.goods_detail_info video{max-width:100%;height:auto;}.goods_detail_info ul{margin-bottom:1rem;}.event_contents ul{padding-left:1rem;margin-bottom:0;}.event_contents li{font-size:12px;}.event_contents p{margin-bottom:0.5rem;}.event_contents p strong{font-size:14px;}`}</style>

      {/* legacy GA4 view_item(대표상품 상세보기). gtag 베이스는 app/m/layout이 로드. */}
      {data.goods_status === "Y" && (
        <Script id="ga4-view-item-mobile" strategy="afterInteractive">
          {`gtag("event","view_item",{currency:"KRW",items:${JSON.stringify(data.ga4)}});`}
        </Script>
      )}
      <MobileGameViewScreen data={data} productId={productId} sku={sku} />
    </>
  );
}
