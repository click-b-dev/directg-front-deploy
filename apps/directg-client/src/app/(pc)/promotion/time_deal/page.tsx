import type { Metadata, Viewport } from "next";

import { getPromotionTimeDeal } from "@entities/promotion-time-deal/api/get-promotion-time-deal";
import { PromotionTimeDealScreen } from "@screens/promotion-time-deal";

/** legacy `pc/promotion/time_deal.html` 하드코딩 상품코드. 페이지가 상수로 박은 것을 그대로 이월. */
const PRODUCT_CODE = "50005634";

/** legacy head: title="타임딜", description="", author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "타임딜",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function TimeDealPage() {
  const data = await getPromotionTimeDeal(PRODUCT_CODE);
  return <PromotionTimeDealScreen data={data} />;
}
