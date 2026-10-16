import type { Metadata, Viewport } from "next";

import { getPromotionSeasonConfig } from "@entities/promotion-season/api/get-promotion-season-config";
import { PromotionSeasonScreen } from "@screens/promotion-season";

/** legacy는 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** legacy `pc/promotion/promotion_season.html` head. title=promotion_season_name 동적 + canonical/alternate. */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getPromotionSeasonConfig();
  return {
    title: config.name,
    description: "",
    authors: [{ name: "H2interactive" }],
    alternates: {
      canonical: "https://directg.net/promotion/promotion_season",
      media: {
        "only screen and (max-width: 640px)": "https://m.directg.net/promotion/promotion_season",
      },
    },
  };
}

export default async function PromotionSeasonPage() {
  const config = await getPromotionSeasonConfig();
  return <PromotionSeasonScreen config={config} />;
}
