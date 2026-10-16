import type { DlcDetailResponse } from "@entities/dlc-detail";

const DOMAIN = "https://image.directg.net";

/** DLC 상세 mock (legacy dlc_view.html). 비로그인(wishlist_chk="N"). */
export const dlcDetailFixture: DlcDetailResponse = {
  goods_status: "Y",
  goods_status_msg: "",
  platform_name: "Steam",
  is_preorder_notice: "N",
  dlc_info: {
    product_code: 5001,
    product_name: "샘플 게임 - 확장 DLC",
    product_name_en: "Sample Game - Expansion DLC",
    goods_sku: "dlc-detail-sku-0001",
    domain: "https://directg.net",
    product_platform: "1",
    is_bonus: "N",
    is_preorder: "N",
    soldout: "N",
    consumer_price: 25000,
    price: 25000,
    discount: 0,
    promotion: { sale_price: 20000, discount_rate: 20, promotion_end: "2026-12-31" },
    release_date: "2025-03-10",
    spoken_korean: "N",
    interface_korean: "Y",
    exclusive_korean: "N",
    wishlist_chk: "N",
  },
  title_info: {
    product_id: "sample-product-0001",
    title_name: "샘플 게임 타이틀",
    developer: "Sample Studio",
    publisher: "Sample Publisher",
    age_limit: "15",
    game_rate: "1010",
  },
  goods_description: {
    short_description: "샘플 게임의 확장 DLC 소개입니다.",
    region_msg: "",
  },
  description_html: "<div><p>이 DLC는 새로운 지역과 스토리를 추가합니다.</p></div>",
  legal_html: "<p>© Sample Publisher. All rights reserved.</p>",
  steam_info: { drm_notice: "", ext_user_account_notice: "" },
  media_list: [
    {
      media_type: "",
      media_id: 1,
      media_url: `${DOMAIN}/upload/product/5001/screenshot/shot1.jpg`,
      media_thumb: `${DOMAIN}/upload/product/5001/screenshot/shot1_thumb.jpg`,
    },
    {
      media_type: "",
      media_id: 2,
      media_url: `${DOMAIN}/upload/product/5001/screenshot/shot2.jpg`,
      media_thumb: `${DOMAIN}/upload/product/5001/screenshot/shot2_thumb.jpg`,
    },
  ],
  package_info: [{ unit_name: "확장 스토리 캠페인" }, { unit_name: "추가 코스튬 팩" }],
  genre_names: ["액션", "어드벤처"],
  category_names: ["싱글 플레이어"],
};

/** 홀로모델 DLC 상세 mock (legacy holomodelsdlc_view.html). 플랫폼 51(HoloModels). */
export const holomodelsDlcDetailFixture: DlcDetailResponse = {
  ...dlcDetailFixture,
  platform_name: "HoloModels",
  dlc_info: {
    ...dlcDetailFixture.dlc_info,
    product_code: 6001,
    product_name: "샘플 홀로모델 - 확장 코스튬 DLC",
    product_name_en: "Sample HoloModel - Costume DLC",
    goods_sku: "holomodelsdlc-sku-0001",
    product_platform: "51",
  },
  title_info: {
    ...dlcDetailFixture.title_info,
    product_id: "sample-holomodels-0001",
    title_name: "샘플 홀로모델 본체",
  },
  goods_description: {
    short_description: "홀로모델 확장 코스튬 DLC 소개입니다.\n두 번째 줄 소개.",
    region_msg: "",
  },
};
