/**
 * 인기게임 타이틀 (legacy `tbl_title_best`⋈`tbl_goods`).
 * 백엔드 계약: `GET /api/main/best-titles` — docs/migration/storefront/main/game-lists.md
 */
export interface BestTitle {
  title_id: string;
  title_name: string;
  release_date: string;
  domain: string;
  sku: string;
  /** 'game' | 'dlc' | 'music' | 'bundle' — 모바일 `#main_best` 카드 badge용(모바일 이관 증분). */
  game_type: string;
}
