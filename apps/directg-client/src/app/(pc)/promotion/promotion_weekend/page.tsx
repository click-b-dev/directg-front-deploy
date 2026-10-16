import type { Metadata, Viewport } from "next";

import { getPromotionWeekendConfig } from "@entities/promotion-weekend/api/get-promotion-weekend-config";
import { PromotionWeekendScreen } from "@screens/promotion-weekend";

/** legacy `pc/promotion/promotion_weekend.html` head. title/canonical/alternate. description 빈, author=H2interactive. */
export const metadata: Metadata = {
  title: "주말특가 프로모션",
  description: "",
  authors: [{ name: "H2interactive" }],
  alternates: {
    canonical: "https://directg.net/promotion/promotion_weekend",
    media: {
      "only screen and (max-width: 640px)": "https://m.directg.net/promotion/promotion_weekend",
    },
  },
};

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function PromotionWeekendPage() {
  const config = await getPromotionWeekendConfig();
  return <PromotionWeekendScreen config={config} />;
}
