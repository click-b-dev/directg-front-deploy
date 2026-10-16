/** game_page 리다이렉트 대상 게임 타입 (legacy goods_item.game_type). */
export type GamePageGameType = "game" | "dlc" | "music" | "bundle" | "accessories";

/**
 * product_code 리졸브 결과 (legacy `getGoodsItemDetail` + `getGoodsOptionTitleInfo`).
 * 계약: `GET /api/game/page-resolve?product_code=X`. view_url 조립은 프론트(game_type switch).
 * 문서: docs/migration/storefront/mobile/game-page.md
 */
export interface GamePageResolve {
  /** goods_item.game_type — view_url 분기. */
  game_type: GamePageGameType;
  /** goods_item.goods_sku — 모든 view_url의 sku. */
  goods_sku: string;
  /** title_info.sku — game/accessories view_url의 product_id. */
  title_sku: string;
}
