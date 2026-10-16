import type { PromotionSeasonConfig } from "@entities/promotion-season";

/**
 * 개발용 fixture — `GET /api/promotion/season/config`. legacy getPromotionSeason 형태.
 * isActive=true(기간 내), notice 배너 노출(view=Y)로 정상 콘텐츠. 접근제한은 isActive=false로 테스트.
 */
export const promotionSeasonConfigFixture: PromotionSeasonConfig = {
  name: "2026 여름 프로모션",
  bannerPc: "https://image.directg.net/f8a5Yy5qu0",
  bannerMobile: "https://image.directg.net/f8a5Yy5qu0",
  bannerLink: "/promotion/promotion_ing_thumb?is_promotion=Y",
  seasonStart: "2026-08-01 00:00:00",
  seasonEnd: "2026-09-30 23:59:59",
  isActive: true,
  allowView: false,
  notice: {
    view: "Y",
    title: "여름 프로모션 최대 80% 할인! 지금 확인하세요.",
    btnUrl: "/promotion/promotion_ing_thumb?is_promotion=Y",
    btnTitle: "할인상품 보기",
  },
};
