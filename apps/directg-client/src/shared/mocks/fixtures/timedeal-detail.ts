import type { TimedealDetailResponse } from "@entities/timedeal-detail";

/** 타임딜 상세 mock (legacy timedeal_view.html). */
export const timedealDetailFixture: TimedealDetailResponse = {
  goods_status: "Y",
  goods_status_msg: "",
  timedeal_info: {
    product_code: 10001,
    product_name: "샘플 게임 타임딜",
    product_name_en: "Sample Game Timedeal",
    goods_sku: "timedeal-sku-0001",
    product_platform: "1",
    soldout: "N",
    consumer_price: 66000,
    age_limit: "15",
    game_rate: "1010",
    spoken_korean: "N",
    interface_korean: "Y",
    release_date: "2024-05-01",
  },
  timedeal_schedule: { timedeal_price: 39600 },
  title_info: { sku: "sample-product-0001" },
  steam_info: {
    developer: "Sample Studio",
    publisher: "Sample Publisher",
    drm_notice: "",
    ext_user_account_notice: "",
  },
  goods_description: { short_description: "타임딜 특가 상품 소개입니다." },
  description_html: "<div><p>기간 한정 타임딜 상품입니다.</p></div>",
  requirements_html: "<p><strong>최소 사양</strong>: Windows 10 / i5 / 8GB</p>",
  legal_html: "<p>© Sample Publisher.</p>",
  genre_names: ["액션", "어드벤처"],
  category_names: ["싱글 플레이어"],
};
