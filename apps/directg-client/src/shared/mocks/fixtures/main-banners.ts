import type { MainBanner } from "@entities/main-banner";

/**
 * 개발용 fixture — 백엔드(`GET /api/main/banners`) 준비 전 SSR 주입.
 * legacy `getMainBanner()` 응답 형태 재현. caption 분기 검증을 위해 케이스 다양화:
 * ① 할인 판매(상품+판매정보), ② 예약구매, ③ option_info 없는 순수 이미지 배너.
 */
export const mainBannersFixture: MainBanner[] = [
  {
    main_banner_pc: "https://image.directg.net/sample-banner-1",
    main_banner_mobile: "https://image.directg.net/sample-banner-1-m",
    main_banner_publisher: "",
    main_banner_link: "/game/game_view?product_id=1001",
    main_banner_target: "_self",
    main_banner_type: "",
    banner_title: "몬스터 헌터 와일즈",
    show_prod_info: "Y",
    show_sale_info: "Y",
    title_info: { publisher: "CAPCOM", sku: "1001" },
    option_info: {
      product_name: "몬스터 헌터 와일즈",
      consumer_price: 79800,
      price: 63840,
      is_preorder: "N",
      release_date: "2026-02-28 00:00:00",
      promotion: { sale_price: 63840 },
    },
  },
  {
    main_banner_pc: "https://image.directg.net/sample-banner-2",
    main_banner_mobile: "https://image.directg.net/sample-banner-2-m",
    main_banner_publisher: "",
    main_banner_link: "/game/game_view?product_id=1002",
    main_banner_target: "_self",
    main_banner_type: "",
    banner_title: "예약 판매작",
    show_prod_info: "Y",
    show_sale_info: "Y",
    title_info: { publisher: "H2 Interactive", sku: "1002" },
    option_info: {
      product_name: "예약 판매작 디럭스 에디션",
      consumer_price: 66000,
      price: 66000,
      is_preorder: "Y",
      is_bonus: "Y",
      release_date: "2026-09-30 00:00:00",
    },
  },
  {
    main_banner_pc: "https://image.directg.net/sample-banner-3",
    main_banner_mobile: "https://image.directg.net/sample-banner-3-m",
    main_banner_publisher: "",
    main_banner_link: "/promotion/promotion_ing_thumb?is_promotion=Y",
    main_banner_target: "_self",
    main_banner_type: "",
    banner_title: "이번 주 할인 프로모션",
    show_prod_info: "N",
    show_sale_info: "N",
  },
];
