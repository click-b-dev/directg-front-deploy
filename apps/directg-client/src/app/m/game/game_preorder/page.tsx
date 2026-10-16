import type { Metadata, Viewport } from "next";

import { getPreorderList } from "@entities/preorder-list/api/get-preorder-list";
import { MobileGamePreorderScreen } from "@screens/mobile-game-preorder";

/** legacy mobile game_preorder.html: width=device-width, initial/minimum/maximum-scale=1, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile game_preorder.html head: title="예약 구매", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "예약 구매",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MobileGamePreorderPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const pageParam = firstParam(sp.page);
  const page = Number(pageParam) > 0 ? Number(pageParam) : 1; // legacy: empty → 1

  const data = await getPreorderList(page);

  return <MobileGamePreorderScreen data={data} />;
}
