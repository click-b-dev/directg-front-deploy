import type { Metadata, Viewport } from "next";

import { getHolomodelsDlcDetail } from "@entities/dlc-detail";
import { MobileHolomodelsDlcViewScreen } from "@screens/mobile-holomodelsdlc-view";

/** legacy mobile holomodelsdlc_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
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

/**
 * legacy `mobile/game/holomodelsdlc_view.html` head — dlc_view와 동형.
 * title=product_name, description=short_description, canonical(directg.net **dlc_view**?sku quirk), manifest, favicon.
 * (OG/amazonbot/GA4/JSON-LD 없음.)
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const sku = firstParam(sp.sku);
  const data = await getHolomodelsDlcDetail(sku);
  const d = data.dlc_info;

  return {
    title: d.product_name,
    description: data.goods_description.short_description,
    keywords: "",
    alternates: { canonical: `https://directg.net/game/dlc_view?sku=${d.goods_sku}` },
    icons: { icon: { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" } },
    manifest: "/manifest.json",
  };
}

export default async function MobileHolomodelsDlcViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sku = firstParam(sp.sku);
  const data = await getHolomodelsDlcDetail(sku);

  return (
    <>
      {/* legacy mobile holomodelsdlc_view.html head 인라인 style (goods_detail_info/nav-pills/appCapsuleSub) */}
      <style>{`.nav-pills .nav-link.active{background:#464f5b;}.goods_detail_info{font-size:12px;}.goods_detail_info p{font-size:12px;}.goods_detail_info img{max-width:100%;height:auto;}.goods_detail_info video{max-width:100%;height:auto;text-align:center;}.goods_detail_info .bb_paragraph{margin-bottom:0px;}.goods_detail_info ul{margin-bottom:0.5rem;}.goods_detail_info h1,.goods_detail_info h2,.goods_detail_info h3,.goods_detail_info h4,.goods_detail_info h5,.goods_detail_info h6{color:#0dcaf0;}#appCapsuleSub{padding-top:56px;}`}</style>

      <MobileHolomodelsDlcViewScreen data={data} />
    </>
  );
}
