// legacy promotion/promotion_ready.php — 승인대기 할인 프로모션(tbl_promotion_schedule, confirm='N', 30/page).

export type PromotionReadyListSearch = {
  page: number;
};

// 할인 프로모션(tbl_promotion_schedule ⋈ tbl_goods_item) 공통 행 스키마.
// 목록(승인대기/진행중/진행예정/종료)이 동일 스키마를 공유하되 화면별 표시 컬럼만 다르다.
export type PromotionReadyListItem = {
  idx: number;
  publisher_name: string; // getPublisherName(publisher_code)
  product_code: string;
  product_name: string;
  product_name_en: string;
  product_srp: number; // b.product_srp 퍼블리셔 SRP(진행예정 화면 SRP 컬럼)
  discount_rate: number; // DGKR 할인율 %
  p_discount_rate: number; // 퍼블리셔 승인 할인율 %
  consumer_price: number; // DG 소비자가
  promotion_srp: number; // 퍼블리셔 승인 SRP
  sale_price: number; // DG 할인판매가
  promotion_start: string; // 'YYYY-MM-DD HH:MM:SS'
  promotion_end: string;
  confirm: string; // 승인대기는 항상 'N', 진행중/예정은 Y/N 혼재
};

export type PromotionPagination = {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
};

export type PromotionReadyListResponse = {
  items: PromotionReadyListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/promotion_ing.php — 진행중인 할인 프로모션(진행중 기간 + 검색필터, 30/page).
// item 스키마는 PromotionReadyListItem 재사용(동일 tbl_promotion_schedule 행). confirm은 Y/N 혼재.
export type PromotionIngListSearch = {
  page: number;
  search_key: string; // search_name | search_product_code
  search_value: string;
  search_confirm: string; // Y | N | ''
};

export type PromotionIngListResponse = {
  items: PromotionReadyListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/promotion_upcoming.php — 진행예정(promotion_start>=now) + 검색필터, ASC 정렬, 30/page.
export type PromotionUpcomingListSearch = {
  page: number;
  search_key: string; // search_name | search_product_code
  search_value: string;
  search_confirm: string; // Y | N | ''
};

export type PromotionUpcomingListResponse = {
  items: PromotionReadyListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/promotion_end.php — 종료(promotion_start<now AND promotion_end<now) + 검색필터, 읽기전용, 30/page.
export type PromotionEndListSearch = {
  page: number;
  search_key: string; // search_name | search_product_code
  search_value: string;
  search_confirm: string; // Y | N | ''
};

export type PromotionEndListResponse = {
  items: PromotionReadyListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/promotion_weekend.php — 주말특가 프로모션(tbl_promotion_weekend, 폼 입력, 30/page).
// 할인 프로모션(tbl_promotion_schedule)과 별개 테이블.
export type WeekendGoodsItem = {
  product_code: string;
  product_name: string;
  game_type: string;
};

export type PromotionWeekendListSearch = {
  page: number;
  search_key: string; // search_name (유일 옵션)
  search_value: string;
};

export type PromotionWeekendListItem = {
  idx: number;
  promotion_week_name: string;
  promotion_week_start: number; // unix sec
  promotion_week_end: number; // unix sec
  is_view: string; // Y | N (raw)
  recommand_goods: WeekendGoodsItem[]; // promotion_week_recommand(| 분해) resolve
  best_goods: WeekendGoodsItem[]; // promotion_week_best(| 분해) resolve
};

export type PromotionWeekendListResponse = {
  items: PromotionWeekendListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/promotion_weekend_view.php — 스토어프론트 카드 미리보기(옵션 resolve).
export type PromotionWeekendViewSearch = {
  idx: number;
};

// getGoodsOptionTitleInfo + getGoodsItemDetail resolve 결과(카드 렌더용).
export type WeekendViewGoods = {
  title_name: string;
  title_id: number;
  title_sku: string;
  title_domain: string; // 추천 hero 이미지 도메인
  product_code: string;
  product_name: string;
  option_domain: string; // 인기 header 이미지 도메인
  goods_sku: string;
  consumer_price: number;
  option_price: number; // option_info.price(비프로모션 시)
  option_discount: number; // option_info.discount(비프로모션 시)
  display_type: string; // basic | edition | ''
  game_type: string; // game | dlc | bundle | ...
  is_preorder: string; // Y | N
  is_bonus: string; // Y | N
  promotion_sale_price: number; // getPromotionGoodsPrice.sale_price(없으면 0)
  promotion_discount_rate: number; // getPromotionGoodsPrice.discount_rate(없으면 0)
};

export type PromotionWeekendView = {
  idx: number;
  promotion_week_name: string;
  promotion_week_banner_link: string;
  recommand: WeekendViewGoods[];
  best: WeekendViewGoods[];
};

// legacy promotion/promotion_weekend_register.php — 등록/수정 겸용.
export type PromotionWeekendRegisterSearch = {
  mode: string; // legacy GET mode — idx>0면 무시(modify 강제)
  idx: number;
};

// modify 프리필용 상세(unix→문자열, recommand/best explode 코드 배열).
export type PromotionWeekendDetail = {
  idx: number;
  promotion_week_name: string;
  promotion_week_start: string; // 'Y-m-d H:i:s'
  promotion_week_end: string;
  promotion_week_banner_link: string;
  recommand: string[]; // 코드(최대 4)
  best: string[]; // 코드(최대 10)
  is_view: string; // Y | N
};

// register/modify 저장 요청(공통).
export type PromotionWeekendSaveRequest = {
  promotion_week_name: string;
  promotion_week_start: string; // 'Y-m-d H:i:s' (백엔드 strtotime→unix)
  promotion_week_end: string;
  promotion_week_banner_link: string;
  recommand: string[]; // 4개(백엔드 | 조인)
  best: string[]; // 10개(백엔드 | 조인)
  is_view: string; // Y | N
};

// legacy promotion/promotion_season.php — 대규모 프로모션(tbl_promotion_season, 카드 레이아웃, 30/page).
export type SeasonGoods = {
  product_code: string;
  product_name: string;
};

export type PromotionSeasonListSearch = {
  page: number;
  search_key: string; // search_name
  search_value: string;
};

export type PromotionSeasonListItem = {
  idx: number;
  promotion_season_name: string;
  promotion_season_start: number; // unix sec
  promotion_season_end: number; // unix sec
  is_view: string; // Y | N
  notice_view: string; // Y | N
  notice_title: string;
  notice_btn_url: string;
  notice_btn_title: string;
  promotion_season_banner_pc: string; // 이미지 URL
  promotion_season_banner_mobile: string;
  promotion_season_recommand_banner: string;
  recommand_goods: SeasonGoods[]; // promotion_season_recommand
  best_goods: SeasonGoods[]; // promotion_season_best
  max_discount_goods: SeasonGoods[]; // promotion_max_discount
  add_repay_goods: SeasonGoods[]; // promotion_add_repay
  price_5000_goods: SeasonGoods[]; // promotion_price_5000
  price_10000_goods: SeasonGoods[]; // promotion_price_10000
};

export type PromotionSeasonListResponse = {
  items: PromotionSeasonListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/promotion_season_view.php — 스토어프론트 카드 미리보기(6섹션, 옵션 resolve).
export type PromotionSeasonViewSearch = {
  idx: number;
};

// #176 WeekendViewGoods + 한국어 플래그(가격대 카드 뱃지용).
export type SeasonViewGoods = {
  title_name: string;
  title_id: number;
  title_sku: string;
  title_domain: string;
  product_code: string;
  product_name: string;
  option_domain: string;
  goods_sku: string;
  consumer_price: number;
  option_price: number;
  option_discount: number;
  display_type: string;
  game_type: string;
  is_preorder: string;
  is_bonus: string;
  spoken_korean: string; // Y | N
  interface_korean: string; // Y | N
  exclusive_korean: string; // Y | N
  promotion_sale_price: number;
  promotion_discount_rate: number;
};

export type PromotionSeasonView = {
  idx: number;
  promotion_season_name: string;
  promotion_season_banner_pc: string;
  promotion_season_banner_link: string;
  recommand: SeasonViewGoods[];
  best: SeasonViewGoods[];
  max_discount: SeasonViewGoods[];
  add_repay: SeasonViewGoods[];
  price_5000: SeasonViewGoods[];
  price_10000: SeasonViewGoods[];
};

// legacy promotion/promotion_season_register.php — 등록/수정 겸용.
export type PromotionSeasonRegisterSearch = {
  mode: string; // idx>0면 무시(modify)
  idx: number;
};

// modify 프리필용 상세(unix→문자열, 6 카테고리 explode 코드).
export type PromotionSeasonDetail = {
  idx: number;
  promotion_season_name: string;
  promotion_season_start: string; // 'Y-m-d H:i:s'
  promotion_season_end: string;
  promotion_season_banner_pc: string;
  promotion_season_banner_mobile: string;
  promotion_season_banner_link: string;
  promotion_season_recommand_banner: string;
  recommand: string[]; // 최대 4
  best: string[]; // 최대 10
  max_discount: string[]; // 최대 3
  add_repay: string[]; // 최대 3
  price_5000: string[]; // 최대 5
  price_10000: string[]; // 최대 5
  max_discount_link: string;
  add_repay_link: string;
  is_view: string;
  notice_title: string;
  notice_btn_title: string;
  notice_btn_url: string;
  notice_view: string;
};

// register/modify 저장 요청(공통). 카테고리는 배열(백엔드 | 조인), 날짜 문자열(백엔드 strtotime→unix).
export type PromotionSeasonSaveRequest = {
  promotion_season_name: string;
  promotion_season_start: string;
  promotion_season_end: string;
  promotion_season_banner_pc: string;
  promotion_season_banner_mobile: string;
  promotion_season_banner_link: string;
  promotion_season_recommand_banner: string;
  recommand: string[]; // 4
  best: string[]; // 10
  max_discount: string[]; // 3
  add_repay: string[]; // 3
  price_5000: string[]; // 5
  price_10000: string[]; // 5
  max_discount_link: string;
  add_repay_link: string;
  is_view: string;
  notice_title: string;
  notice_btn_title: string;
  notice_btn_url: string;
  notice_view: string;
};

// legacy promotion/offline_coupon_list.php — 오프라인 쿠폰(tbl_offline_coupon, DGKR DB, 20/page).
export type OfflineCouponListSearch = {
  page: number;
  search_type: string; // toc.coupon_name | toc.partner
  search_value: string;
};

export type OfflineCouponListItem = {
  sno: number;
  coupon_name: string;
  regdt: string;
  partner: string;
  sdate: string;
  edate: string;
  coupon_price: number;
  currency: string;
  code_type: string; // DOWNLOAD | STATIC | DYNAMIC
  issue_limit_cnt: number;
  use_count: number; // getOfflineCouponUseCount
  status: number; // 0 발급대기 | 1 발급중 | 2 일시정지 | 3 발급종료
};

export type OfflineCouponListResponse = {
  items: OfflineCouponListItem[];
  pagination: PromotionPagination;
};

// legacy promotion/offline_coupon_view.php — 상세(기본정보 + 사용현황).
export type OfflineCouponViewSearch = {
  sno: number;
  page: number;
  searchTitle: string; // 회원아이디(등호)
};

export type OfflineCouponViewInfo = {
  coupon_name: string;
  reason: string;
  issue_limit_cnt: number;
  sdate: string; // DB raw 'YYYY-MM-DD HH:MM:SS'
  edate: string;
  partner: string;
};

export type OfflineCouponUsedItem = {
  number: string;
  m_id: string;
  regdt: string;
};

export type OfflineCouponUsedResponse = {
  info: OfflineCouponViewInfo;
  items: OfflineCouponUsedItem[];
  pagination: PromotionPagination;
};

// legacy promotion/offline_coupon_register.php — 등록/수정 겸용.
export type OfflineCouponRegisterSearch = {
  mode: string; // update | (그외 register)
  sno: number;
};

// update 프리필용 상세.
export type OfflineCouponDetail = {
  sno: number;
  coupon_name: string;
  reason: string;
  issueLimitCnt: number;
  sdate: string; // datetime-local 'YYYY-MM-DDTHH:MM'
  edate: string;
  partner: string;
  code_type: string; // STATIC | DYNAMIC | DOWNLOAD
  coupon_price: number;
  promotion_code: string;
  issuePerPersonLimitYn: string; // "Y" | ""
  issuePerPersonLimitCnt: number;
  dailyIssuePerPersonLimitCnt: number;
};

// register/update 저장 요청(공통).
export type OfflineCouponSaveRequest = {
  coupon_name: string;
  reason: string;
  issueLimitCnt: number;
  sdate: string;
  edate: string;
  partner: string;
  code_type: string;
  coupon_price: number;
  promotion_code: string;
  issuePerPersonLimitYn: string; // "Y" | ""
  issuePerPersonLimitCnt: number;
  dailyIssuePerPersonLimitCnt: number;
};

// legacy promotion_ps.php mode=file_register — 엑셀 업로드(파일 실체 대신 name+MIME만 전송, 파싱은 백엔드).
export type PromotionUploadRequest = {
  file_name: string;
  file_type: string; // MIME(File.type) — 확장자 검증용
};

// 업로드/승인/삭제 공통 결과. message는 업로드 확장자 검증 실패 시 legacy 에러 문자열.
export type PromotionActionResult = {
  success: boolean;
  message?: string;
};
