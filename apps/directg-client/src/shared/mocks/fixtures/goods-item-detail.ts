import type { GoodsItemDetailResponse } from "@entities/goods-item-detail";

const DOMAIN = "https://image.directg.net";

/** 액세서리/실물 상품 상세 mock (legacy goods_item_view.html). 비로그인, delivery_type=3(관련게임 표시). */
export const goodsItemDetailFixture: GoodsItemDetailResponse = {
  goods_status: "Y",
  goods_status_msg: "",
  option_item: {
    product_code: 8001,
    product_name: "샘플 게임 한정판 스틸북 에디션",
    product_name_en: "Sample Game Steelbook Edition",
    goods_sku: "goods-item-sku-0001",
    domain: "https://directg.net",
    soldout: "N",
    consumer_price: 99000,
    price: 99000,
    discount: 0,
    promotion: { sale_price: 79000, discount_rate: 20, promotion_end: "2026-12-31" },
    delivery_type: "3",
    steam_appid: 1001,
    wishlist_chk: "N",
  },
  title_info: {
    title_id: "sample-title-0001",
    title_name: "샘플 게임 타이틀",
    age_limit: "15",
    game_rate: "1010",
    spoken_korean: "N",
    interface_korean: "Y",
  },
  media_list: [
    {
      media_type: "image",
      media_id: 1,
      media_url: `${DOMAIN}/upload/product/8001/screenshot/shot1.jpg`,
      media_thumb: `${DOMAIN}/upload/product/8001/screenshot/shot1_thumb.jpg`,
    },
  ],
  attribute_info: {
    delivery_method_info: "택배 (CJ대한통운)",
    as_information2: "1544-2367",
    product_name: "샘플 게임 한정판 스틸북 에디션",
    model_name: "DG-STEEL-0001",
    kc_safety_infomartion: "R-R-XXX-000000",
    rated_voltage: "해당없음",
    power: "해당없음",
    manufacturing_date: "2024-06",
    manufacturer: "(주)에이치투인터렉티브 / H2 Interactive",
    manufacture_country: "대한민국",
    size: "170 x 130 x 15",
    weight: "0.3",
    main_requirements: "상품페이지 참조",
    warranty_service: "소비자분쟁해결기준에 따름",
    as_information: "1544-2367",
  },
  description_html: "<h4>상품 상세</h4><p>한정판 스틸북과 특전이 포함된 패키지입니다.</p>",
  show_game_info: "Y",
  steam_game_info: {
    game_name: "Sample Game Title",
    release_date: "2024년 06월 02일",
    developer: "Sample Studio",
    publisher: "Sample Publisher",
    genres: ["액션", "어드벤처"],
    categories: ["싱글 플레이어", "controller 지원"],
  },
};
