import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy dashboard_goods.php — read-only 스냅샷. 실제 6 SQL·라벨은 백엔드.
// mock은 고정 payload(CRUD 아님). total은 items 길이와 일치(임계 초과 "외 N건" 미시연).
const dashboard = {
  selling_soldout: {
    total: 3,
    items: [
      {
        product_code: "DG20001",
        product_name: "젤다의 전설 왕국의 눈물",
        order_system_label: "Asset",
        stock_check_link:
          "/goods/stock/goods_option_stock?search_key=search_asset_id&search_value=A1001",
        promo_active: 1,
      },
      {
        product_code: "DG20002",
        product_name: "발더스 게이트 3",
        order_system_label: "Ztorm",
        stock_check_link: "",
        promo_active: 0,
      },
      {
        product_code: "DG20003",
        product_name: "포켓몬스터 스칼렛",
        order_system_label: "-",
        stock_check_link: "",
        promo_active: 0,
      },
    ],
  },
  stock_soldout: {
    total: 2,
    items: [
      {
        product_code: "DG20010",
        product_name: "슈퍼마리오 원더",
        item_id: "A2001",
        item_name: "마리오 원더 스탠다드",
        stock: 42,
        promo_active: 0,
      },
      {
        product_code: "DG20011",
        product_name: "메트로이드 프라임",
        item_id: "A2002",
        item_name: "메트로이드 디럭스",
        stock: 7,
        promo_active: 1,
      },
    ],
  },
  issue_price: {
    total: 3,
    items: [
      { product_code: "DG20020", product_name: "가격 미설정 상품 A" },
      { product_code: "DG20021", product_name: "가격 미설정 상품 B" },
      { product_code: "DG20022", product_name: "가격 미설정 상품 C" },
    ],
  },
  issue_delivery: {
    total: 2,
    items: [
      { product_code: "DG20030", product_name: "배송미설정 게임", game_type_label: "게임" },
      { product_code: "DG20031", product_name: "배송미설정 DLC", game_type_label: "DLC" },
    ],
  },
  promo: { upcoming: 5, active: 12, ending: 3 },
  promo_notselling: [
    { product_code: "DG20040", product_name: "프로모션중 판매종료 상품", status_label: "판매종료" },
    { product_code: "DG20041", product_name: "프로모션중 판매예정 상품", status_label: "판매예정" },
  ],
  preorder_list: [
    {
      product_code: "DG20050",
      product_name: "출시예정 신작 A",
      release_date: "2026-08-01",
      order_system_label: "Asset",
    },
    {
      product_code: "DG20051",
      product_name: "출시예정 신작 B",
      release_date: "2026-08-15",
      order_system_label: "Genba",
    },
  ],
};

export const goodsDashboardHandlers = [
  http.get(api("/admin/goods/dashboard"), () => HttpResponse.json(dashboard)),
];
