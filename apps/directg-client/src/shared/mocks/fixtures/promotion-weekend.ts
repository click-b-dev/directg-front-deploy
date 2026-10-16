import type { PromotionWeekendConfig } from "@entities/promotion-weekend";

/**
 * 개발용 fixture — `GET /api/promotion/weekend/config`. legacy getPromotionWeekend 형태.
 * isActive=true(기간 내)로 정상 콘텐츠 노출. 접근제한 테스트는 isActive=false로 조정.
 */
export const promotionWeekendConfigFixture: PromotionWeekendConfig = {
  name: "주말특가 프로모션",
  bannerLink: "/promotion/promotion_ing_thumb?is_promotion=Y",
  weekStart: "2026-09-04 16:00:00",
  weekEnd: "2026-09-07 16:00:00",
  isActive: true,
  allowView: false,
};
