import type { PromotionGroup } from "@entities/promotion-group";

/**
 * 개발용 fixture — 백엔드(`GET /api/promotion/groups`) 준비 전 SSR 주입에 사용.
 * legacy `tbl_group` 응답 형태(현재 활성 그룹 프로모션) 재현.
 * 실제 운영값은 백엔드 연결 시 대체된다.
 */
export const promotionGroupsFixture: PromotionGroup[] = [
  {
    idx: 1,
    subject: "가을 프로모션",
    start_date: 1_756_998_000, // 2026-09-04 (예시)
    end_date: 1_759_244_400, // 2026-09-30 (예시)
  },
];
