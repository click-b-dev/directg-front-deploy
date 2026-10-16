import type { GamePackageDetailResponse } from "@entities/game-package-detail";

/** 개발용 fixture — `GET /api/game/package-detail`. legacy getGoodsItemDetailSku + getTitleDetail 조립 형태. */
export const gamePackageDetailFixture: GamePackageDetailResponse = {
  goods_status: "Y",
  goods_status_msg: "",
  goods_item: {
    product_code: "P0001",
    product_name: "패키지 상품 A (디럭스 에디션)",
    domain: "https://directg.net",
    goods_sku: "P0001-DELUXE",
    soldout: "N",
    release_date: "2026-05-20 00:00:00",
    consumer_price: 88000,
    price: 79200,
    discount: 0,
    promotion: { sale_price: 79200, discount_rate: 10 },
  },
  title_info: {
    product_id: "T0001",
    title_name: "타이틀 A",
    developer: "개발사 A",
    publisher: "퍼블리셔 A",
    age_limit: "15",
    game_rate: "1010",
    spoken_korean: "N",
    interface_korean: "Y",
    exclusive_korean: "N",
  },
  short_description: "패키지 상품 A 요약 설명입니다.",
  region_msg: "",
  package_units: ["타이틀 A 본편", "시즌 패스", "디지털 아트북"],
  genre_tags: ["액션", "RPG"],
  category_tags: ["싱글플레이"],
  description_html: "<p>패키지 상품 A의 상세 설명입니다.</p>",
};
