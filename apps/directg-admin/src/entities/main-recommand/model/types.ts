// legacy tbl_main_recommand (docs/migration/admin/site/recommand-list.md).
// recommand_start/recommand_end는 legacy처럼 unix epoch 초(int).

export type ViewFlag = "Y" | "N";

// 추천 상품 슬롯(recommand_goods_1~4) — 서버가 tbl_goods_item으로 enrich(빈 슬롯도 4개 유지).
export type RecommandGoods = {
  product_code: string;
  product_name: string;
  game_type: string;
};

export type MainRecommandListItem = {
  idx: number;
  recommand_sort: number;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_name: string;
  recommand_start: number;
  recommand_end: number;
  is_view: ViewFlag;
  goods: RecommandGoods[];
};

export type MainRecommandPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type MainRecommandListResponse = {
  items: MainRecommandListItem[];
  pagination: MainRecommandPagination;
};

// legacy는 폼(search_recommand_name)과 서버(search_banner_title)의 파라미터 불일치로 검색이
// 무효였다. 개발자 지시로 이를 수정 — search_recommand_name으로 recommand_name을 필터한다.
export type MainRecommandListQuery = {
  page?: number;
  search_recommand_name?: string;
};

// legacy main_recommand_ps.php: recommand_sort_up(=-1) / recommand_sort_down(=+1).
export type RecommandSortDirection = "up" | "down";

export type RecommandMutationResponse = { success: boolean };

// legacy main_recommand_ps.php register — 폼 필드 그대로. 날짜는 "YYYY-MM-DD HH:MM:SS" 문자열(서버 strtotime).
export type CreateMainRecommandRequest = {
  recommand_name: string;
  recommand_start: string;
  recommand_end: string;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_banner_target: string;
  recommand_goods_1: string;
  recommand_goods_2: string;
  recommand_goods_3: string;
  recommand_goods_4: string;
  is_view: ViewFlag;
};

// legacy main_recommand_modify.php: select * where idx — 폼 프리필용 단건(goods는 raw 코드).
export type MainRecommandDetail = {
  idx: number;
  recommand_name: string;
  recommand_start: number;
  recommand_end: number;
  recommand_banner: string;
  recommand_banner_link: string;
  recommand_banner_target: string;
  recommand_goods_1: string;
  recommand_goods_2: string;
  recommand_goods_3: string;
  recommand_goods_4: string;
  is_view: ViewFlag;
};

// legacy main_recommand_ps.php modify — register와 동일 필드 UPDATE(WHERE idx).
export type UpdateMainRecommandRequest = CreateMainRecommandRequest;
