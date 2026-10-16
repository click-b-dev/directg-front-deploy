import type { MypageRetailOrderViewResponse } from "@entities/mypage-order";

/**
 * 개발용 fixture — 백엔드(`GET /api/mypage/retail-orders/view`, 별도 DGKR DB) 준비 전 주입.
 * legacy getRetailOrder + kcp 로그 결과 형태. step 4(배송중) + CARD + reserve_id 없음.
 */
export const mypageRetailOrderViewFixture: MypageRetailOrderViewResponse = {
  order: {
    settle_no: "RT-20260830-0001",
    goods_code: "GOODS-TS-001",
    goods_nm: "다이렉트게임즈 굿즈 티셔츠 (L)",
    settleprice: 29000,
    reserve_id: "",
    step: "4",
    is_lic_actv: "0",
    asset_id: "",
    ord_ymd: "2026-08-30",
    zipcode: "06035",
    address: "서울특별시 강남구 가로수길 5",
    address_detail: "3층 301호",
    name: "홍길동",
    tracking_no: "1234567890123",
    message: "부재 시 문 앞에 놓아주세요.",
    phone: "010-1234-5678",
    pg_provider: "kcp",
    settlekind: "CARD",
    regdt: "2026-08-30 15:10:00",
    emoney: 1000,
    coupon: 0,
    cash: 500,
  },
  naverpay: null,
  kcp: {
    app_no: "30123456",
    bank_name: "",
    cash_no: "",
    cash_authno: "",
  },
};
