import type { Metadata, Viewport } from "next";

import { getGoodsItemDetail } from "@entities/goods-item-detail";
import { MobileGoodsItemViewScreen } from "@screens/mobile-goods-item-view";

/** legacy mobile goods_item_view.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
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

/** legacy mobile goods_item_view.html head: title = product_name, description/keywords 빈값, manifest. canonical/OG 없음. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);
  const sku = firstParam(sp.sku);
  const data = await getGoodsItemDetail(productId, sku);

  return {
    title: data.option_item.product_name,
    description: "",
    keywords: "",
    manifest: "/manifest.json",
  };
}

export default async function MobileGoodsItemViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const productId = firstParam(sp.product_id);
  const sku = firstParam(sp.sku);
  const data = await getGoodsItemDetail(productId, sku);

  return (
    <>
      {/* legacy mobile goods_item_view.html head 인라인 style */}
      <style>{`.nav-pills .nav-link.active{background:#464f5b;}.goods_detail_info{font-size:12px;}.goods_detail_info p{font-size:12px;}.goods_detail_info img{width:100%;}.goods_detail_info ul{margin-bottom:1rem;}`}</style>

      <MobileGoodsItemViewScreen data={data} />
    </>
  );
}
