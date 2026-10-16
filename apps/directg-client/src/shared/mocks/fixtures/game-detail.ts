import type { GameDetailResponse, GameOption, RecommandItem } from "@entities/game-detail";

/**
 * 게임 상세 mock (legacy `pc/game/game_view.html`). 비로그인 상태(is_login="N", 전 옵션 wishlist_chk="N").
 * 플랫폼 2종(steam=1, epic=34), 기본게임/에디션/DLC(5개 — collapse 검증)/DLC번들/이벤트/추천 포함.
 */

const DOMAIN = "https://image.directg.net";
const TITLE_ID = "sample-title-0001";

const mkOption = (
  o: Partial<GameOption> & { product_code: number; product_name: string; goods_sku: string },
): GameOption => ({
  product_platform: "1",
  price: 55000,
  consumer_price: 66000,
  discount: 17,
  delivery_type: "1",
  is_bonus: "N",
  is_preorder: "N",
  soldout: "N",
  is_promotion: "N",
  promotion_label: "bg-primary",
  promotion_end: "",
  wishlist_chk: "N",
  ...o,
});

const dlcList: GameOption[] = Array.from({ length: 5 }, (_, i) =>
  mkOption({
    product_code: 2001 + i,
    product_name: `샘플 게임 DLC ${i + 1} - 확장팩`,
    goods_sku: `dlc-sku-000${i + 1}`,
    price: 12000 + i * 1000,
    consumer_price: 15000 + i * 1000,
    discount: 20,
  }),
);

const recommand: RecommandItem[] = Array.from({ length: 4 }, (_, i) => ({
  sku: `recommand-sku-000${i + 1}`,
  title_id: `recommand-title-000${i + 1}`,
  domain: "https://directg.net",
  product_code: 3001 + i,
  product_name: `추천 게임 타이틀 ${i + 1}`,
  consumer_price: 44000,
  price: 39600,
  discount: i % 2 === 0 ? 10 : 0,
  delivery_type: "1",
  is_preorder: "N",
  is_bonus: i === 1 ? "Y" : "N",
  is_promotion: i % 2 === 0 ? "Y" : "N",
  promotion_label: i % 2 === 0 ? "bg-danger" : "bg-primary",
}));

export const gameDetailFixture: GameDetailResponse = {
  goods_status: "Y",
  goods_status_msg: "",
  is_login: "N",
  platform: "1",
  platform_name: "Steam",
  genre_names: ["액션", "어드벤처"],
  category_names: ["싱글 플레이어", "controller 지원"],
  title_info: {
    sku: "sample-product-0001",
    title_id: TITLE_ID,
    title_name: "샘플 게임 타이틀",
    title_name_en: "Sample Game Title",
    domain: "https://directg.net",
    genre: "G0001001,G0001002",
    category: "C0001001,C0001002",
    publisher: "Sample Publisher",
    developer: "Sample Studio",
    drm_notice: "",
    ext_user_account_notice: "",
    age_limit: "15",
    game_rate: "1010",
    spoken_korean: "Y",
    interface_korean: "Y",
    exclusive_korean: "N",
    coming_soon: "N",
    coming_soon_date: "",
    release_date: "2024-11-15",
  },
  goods_description: {
    short_description: "샘플 게임 타이틀의 짧은 소개 문구입니다.",
    region_msg: "",
  },
  media_list: [
    {
      media_type: "video",
      media_id: "dQw4w9WgXcQ",
      media_url: "//youtube.com/embed/dQw4w9WgXcQ",
      media_thumb: "https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg",
    },
    {
      media_type: "image",
      media_id: 1,
      media_url: `${DOMAIN}/upload/title/${TITLE_ID}/screenshot/shot1.jpg`,
      media_thumb: `${DOMAIN}/upload/title/${TITLE_ID}/screenshot/shot1_thumb.jpg`,
    },
    {
      media_type: "image",
      media_id: 2,
      media_url: `${DOMAIN}/upload/title/${TITLE_ID}/screenshot/shot2.jpg`,
      media_thumb: `${DOMAIN}/upload/title/${TITLE_ID}/screenshot/shot2_thumb.jpg`,
    },
  ],
  title_platform: [{ product_platform: "1" }, { product_platform: "34" }],
  goods_item: {
    "1": {
      game: [
        mkOption({
          product_code: 1001,
          product_name: "샘플 게임 타이틀 (스팀)",
          goods_sku: "game-sku-0001",
          is_promotion: "Y",
          promotion_label: "bg-danger",
          promotion_end: "2026-12-31",
          discount: 25,
          price: 49500,
        }),
      ],
      edition: [
        mkOption({
          product_code: 1101,
          product_name: "샘플 게임 타이틀 - 디럭스 에디션 (스팀)",
          goods_sku: "edition-sku-0001",
          price: 79000,
          consumer_price: 89000,
          discount: 11,
          is_bonus: "Y",
        }),
      ],
      dlc: dlcList,
      dlc_bundle: [
        mkOption({
          product_code: 1301,
          product_name: "샘플 게임 타이틀 - DLC 번들 (스팀)",
          goods_sku: "dlc-bundle-sku-0001",
          promotion_discount: 30,
          is_promotion: "Y",
          promotion_label: "bg-danger",
          promotion_end: "2026-12-31",
          price: 30000,
          consumer_price: 45000,
          discount: 30,
        }),
      ],
    },
    "34": {
      game: [
        mkOption({
          product_code: 1002,
          product_name: "샘플 게임 타이틀 (에픽)",
          goods_sku: "game-sku-0002",
          product_platform: "34",
        }),
      ],
    },
  },
  is_event_info: "Y",
  event_data: {
    event_link_url: "/event/event",
    event_link_target: "_self",
    event_banner: "https://directg.net/assets/images/sample/event_banner.jpg",
    subject: "샘플 게임 출시 기념 이벤트",
    contents_html: "<p>구매 시 추가 포인트를 드립니다.</p>",
    event_notes_html: "<p>이벤트 유의사항 안내입니다.</p>",
  },
  recommand_title: recommand,
  flags: {
    is_early_access: "N",
    is_free: "N",
    only_multiplayer: "N",
  },
  description_html:
    "<h1>게임 소개</h1><div>샘플 게임 타이틀의 상세 설명입니다. 방대한 오픈월드를 탐험하세요.</div>",
  requirements_html:
    "<p><strong>최소 사양</strong>: OS Windows 10 / CPU i5 / RAM 8GB / GPU GTX 1060</p>",
  legal_html: "<p>© Sample Publisher. All rights reserved.</p>",
  ga4: [
    {
      item_id: 1001,
      item_name: "샘플 게임 타이틀 (스팀)",
      index: 0,
      item_brand: "Sample Publisher",
      item_category: "G0001001",
      item_category2: "G0001002",
      item_category3: "",
      item_category4: "",
      item_category5: "",
      item_list_id: "game_view",
      item_list_name: "대표상품 상세보기",
      price: 49500,
      discount: 25,
      quantity: "1",
    },
  ],
};

/** 장르/카테고리 코드 → 태그명(legacy getTagName mock). */
export const gameDetailTagNames: Record<string, string> = {
  G0001001: "액션",
  G0001002: "어드벤처",
  C0001001: "싱글 플레이어",
  C0001002: "controller 지원",
};

/** 플랫폼 코드 → 이름(legacy getPlatform mock). */
export const gameDetailPlatformNames: Record<string, string> = {
  "1": "Steam",
  "34": "Epic Games",
  "35": "Rockstar Games",
  "51": "HoloModels",
};
