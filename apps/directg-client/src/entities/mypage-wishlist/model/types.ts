/**
 * 위시리스트 (legacy `tbl_wishlist` ⋈ `tbl_goods_item` — Mypage2::getWishlist + 프로모션/타이틀 enrich).
 * 계약: `GET /api/mypage/wishlist`, `POST /api/mypage/wishlist`.
 * 문서: docs/migration/storefront/mypage/wishlist.md
 */
export interface WishlistItem {
  idx: number;
  reg_date: string;
  product_code: string;
  product_name: string;
  consumer_price: number;
  /** 프로모션 해석 후 판매가(백엔드 계산). */
  price: number;
  /** 프로모션 해석 후 할인률(백엔드 계산). */
  discount: number;
  /** "Y"=프로모션 적용가. */
  is_promotion: string;
  /** "0" 판매중 / "3" 판매종료. */
  status: string;
  /** "Y"=품절. */
  soldout: string;
  goods_sku: string;
  game_type: string;
  display_type: string;
  product_platform: string;
  /** getGoodsOptionTitleInfo['sku'] — game/accessories/holomodels view_url용. */
  title_sku: string;
  /** tbl_goods_item.age_limit — 모바일 연령 게이팅용(age_limit>17 && age_limit>회원나이 → 체크박스 숨김). PC 미사용. */
  age_limit: number;
}

export interface WishlistResponse {
  list: WishlistItem[];
  page: number;
  totalPages: number;
}

/** 위시리스트 액션 요청 (legacy wishlist_proc mode). */
export interface WishlistActionRequest {
  mode: "delete" | "select_delete" | "cart_move";
  idx?: number;
  idx_arr?: number[];
  product_code_arr?: string[];
}

export interface WishlistActionResponse {
  error_code: string;
  error_msg: string;
}
