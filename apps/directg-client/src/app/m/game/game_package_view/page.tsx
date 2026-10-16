import type { Metadata, Viewport } from "next";

import { getGamePackageDetail } from "@entities/game-package-detail/api/get-game-package-detail";
import { MobileGamePackageViewScreen } from "@screens/mobile-game-package-view";

/** legacy mobile game_package_view.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
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

/** legacy head: title=goods_item.product_name 동적. sku로 조회. */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const data = await getGamePackageDetail(firstParam(sp.sku));
  return {
    title: data.goods_item.product_name,
    description: "",
    keywords: "",
    appleWebApp: { statusBarStyle: "black-translucent" },
  };
}

export default async function MobileGamePackageViewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const data = await getGamePackageDetail(firstParam(sp.sku));
  return <MobileGamePackageViewScreen data={data} />;
}
