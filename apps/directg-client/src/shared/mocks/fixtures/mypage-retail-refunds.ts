import type { RetailOrderItem } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/retail-refunds`, 별도 DGKR DB retail_order) 준비 전 주입.
 * legacy getRetailOrderList 결과 형태(retail-orders와 동일). step 필터(8·9·11·12·13·14) 반영 —
 * 취소요청/취소완료/반품요청/반품수거중/반품수거완료/반품완료만. 분기 커버: settlekind 다양 / naverpay 선행.
 */
export const mypageRetailRefundsFixture: RetailOrderItem[] = [
  {
    settle_no: "RT-20260830-0011",
    goods_nm: "다이렉트게임즈 굿즈 티셔츠 (L)",
    pg_provider: "kcp",
    settlekind: "CARD",
    settleprice: 29000,
    regdt: "2026-08-30 15:10:00",
    step: "8",
  },
  {
    settle_no: "RT-20260822-0012",
    goods_nm: "게임 피규어 컬렉션 세트",
    pg_provider: "naverpay",
    settlekind: "NPAY",
    settleprice: 89000,
    regdt: "2026-08-22 11:42:12",
    step: "11",
  },
  {
    settle_no: "RT-20260815-0013",
    goods_nm: "한정판 아트북",
    pg_provider: "kakao",
    settlekind: "KAKAOM",
    settleprice: 45000,
    regdt: "2026-08-15 09:05:33",
    step: "13",
  },
  {
    settle_no: "RT-20260810-0014",
    goods_nm: "스팀 기프트카드 5만원권",
    pg_provider: "kcp",
    settlekind: "GIFT",
    settleprice: 50000,
    regdt: "2026-08-10 20:30:00",
    step: "9",
  },
  {
    settle_no: "RT-20260805-0015",
    goods_nm: "게이밍 마우스패드 XL",
    pg_provider: "kcp",
    settlekind: "BANK",
    settleprice: 18000,
    regdt: "2026-08-05 13:22:41",
    step: "14",
  },
];
