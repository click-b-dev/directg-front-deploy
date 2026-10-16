import type { Metadata, Viewport } from "next";

import { getDlcDetail } from "@entities/dlc-detail";
import { MobileDlcViewScreen } from "@screens/mobile-dlc-view";

/** legacy mobile dlc_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
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
 * legacy `mobile/game/dlc_view.html` head — PC보다 단순.
 * title=product_name, description=short_description, canonical(directg.net dlc_view?sku), manifest, favicon.
 * (OG/amazonbot/author·GA4·JSON-LD 없음.)
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const sku = firstParam(sp.sku);
  const data = await getDlcDetail(sku);
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

export default async function MobileDlcViewPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const sku = firstParam(sp.sku);
  const data = await getDlcDetail(sku);

  return (
    <>
      {/* legacy mobile dlc_view.html head 인라인 style (goods_detail_info/nav-pills/appCapsuleSub) */}
      <style>{`.nav-pills .nav-link.active{background:#464f5b;}.goods_detail_info{font-size:12px;}.goods_detail_info p{font-size:12px;}.goods_detail_info img{max-width:100%;height:auto;}.goods_detail_info video{max-width:100%;height:auto;text-align:center;}.goods_detail_info .bb_paragraph{margin-bottom:0px;}.goods_detail_info ul{margin-bottom:0.5rem;}.goods_detail_info h1,.goods_detail_info h2,.goods_detail_info h3,.goods_detail_info h4,.goods_detail_info h5,.goods_detail_info h6{color:#0dcaf0;}#appCapsuleSub{padding-top:56px;}`}</style>

      <MobileDlcViewScreen data={data} />
    </>
  );
}
