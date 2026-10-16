import type { Metadata, Viewport } from "next";

import { getBundleDetail } from "@entities/bundle-detail";
import { MobileBundleViewScreen } from "@screens/mobile-bundle-view";

/** legacy mobile bundle_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
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

/** legacy mobile bundle_view.html head: title 고정 "상세정보", canonical(sku), description/keywords 빈값. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const sku = firstParam(sp.sku);
  return {
    title: "상세정보",
    description: "",
    keywords: "",
    alternates: { canonical: `https://directg.net/game/bundle_view?sku=${sku}` },
    manifest: "/manifest.json",
  };
}

export default async function MobileBundleViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const sku = firstParam(sp.sku);
  const data = await getBundleDetail(sku);

  return (
    <>
      {/* legacy mobile bundle_view.html head 인라인 style */}
      <style>{`.nav-pills .nav-link.active{background:#464f5b;}.goods_detail_info{font-size:12px;}.goods_detail_info p{font-size:12px;}.goods_detail_info img{width:100%;height:auto;}.goods_detail_info ul{margin-bottom:1rem;}.goods_detail_info video{max-width:100%;height:auto;}#appCapsuleSub{padding-top:56px !important;}`}</style>

      <MobileBundleViewScreen data={data} />
    </>
  );
}
