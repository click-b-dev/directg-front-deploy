import type { Metadata, Viewport } from "next";

import { getTimedeal } from "@entities/promotion-timedeal";
import { MobilePromotionTimedealScreen } from "@screens/mobile-promotion-timedeal";

/** legacy mobile timedeal.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile timedeal.html head: title="타임딜", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "타임딜",
  description: "",
  keywords: "",
};

export default async function MobilePromotionTimedealPage() {
  const data = await getTimedeal(); // 공개(세션 불필요)
  return <MobilePromotionTimedealScreen data={data} />;
}
