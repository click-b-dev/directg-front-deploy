import type { PreorderTitle } from "@entities/preorder-list";

/** 개발용 fixture — `GET /api/game/preorder`. 타이틀 단위 + 옵션 병합(game/edition/dlc). */
export const preorderListFixture: PreorderTitle[] = [
  {
    title_id: "T0001",
    sku: "T0001",
    title_name: "예약 타이틀 A",
    domain: "https://directg.net",
    release_date: "2026-12-01",
    options: [
      {
        product_code: "T0001-GAME",
        product_name: "예약 타이틀 A (기본판)",
        consumer_price: 66000,
        price: 59400,
        discount: 10,
        is_promotion: "Y",
        promotion_label: "bg-danger",
      },
      {
        product_code: "T0001-DELUXE",
        product_name: "예약 타이틀 A (디럭스 에디션)",
        consumer_price: 88000,
        price: 88000,
        discount: 0,
        is_promotion: "N",
        promotion_label: "bg-primary",
      },
    ],
  },
  {
    title_id: "T0002",
    sku: "T0002",
    title_name: "예약 타이틀 B",
    domain: "https://directg.net",
    release_date: "2027-01-15",
    options: [
      {
        product_code: "T0002-GAME",
        product_name: "예약 타이틀 B",
        consumer_price: 44000,
        price: 44000,
        discount: 0,
        is_promotion: "N",
        promotion_label: "bg-primary",
      },
    ],
  },
];
