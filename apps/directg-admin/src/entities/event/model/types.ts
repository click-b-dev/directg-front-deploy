// legacy _Admin_/event/* — 이벤트 관리.

// legacy event_board_list.php — AdminBoard::getEventList (tbl_event, 10/page).
export interface EventBoardSearch {
  page: number;
  is_view: string; // "" | "Y" | "N"
}

export interface EventBoardItem {
  idx: number;
  event_gubun: string; // "1".."6"
  subject: string;
  contents_html: string; // Parsedown(htmlspecialchars_decode(contents)) — 백엔드 렌더
  start_date: number; // unix sec
  end_date: number; // unix sec
  event_banner: string;
  event_link_url: string;
  is_view: string; // "Y" | "N"
  show_promotion: string; // "Y" | "N"
}

export interface EventPagination {
  current_page: number;
  results_per_page: number;
  total_results: number;
  total_pages: number;
}

export interface EventBoardListResponse {
  items: EventBoardItem[];
  pagination: EventPagination;
}

// legacy event_board_register.php(idx>0) — tbl_event 단건(폼 프리필).
export interface EventBoardDetail {
  idx: number;
  event_gubun: string;
  subject: string;
  contents: string; // htmlspecialchars_decode된 마크다운 소스(백엔드)
  event_notes: string; // htmlspecialchars_decode된 마크다운 소스(백엔드)
  start_date: number; // unix sec
  end_date: number; // unix sec
  event_banner: string;
  event_link_target: string; // "_self" | "_blank"
  event_link_url: string;
  is_view: string; // "Y" | "N"
  show_promotion: string; // "Y" | "N"
}

// legacy event_board_ps.php mode=register/modify — tbl_event 저장.
export interface EventBoardSaveRequest {
  gubun: string; // event_gubun
  subject: string;
  contents: string;
  event_notes: string;
  start_date: string; // "Y-m-d H:i" (백엔드 strtotime)
  end_date: string;
  event_banner: string;
  event_link_target: string;
  event_link_url: string;
  is_view: string;
  show_promotion: string;
}

export interface EventBoardActionResult {
  success: boolean;
}

// legacy event_board_modify.php — tbl_event_goods(event_no별 이벤트 상품).
export interface EventGoodsItem {
  idx: number;
  product_code: string;
  product_name: string;
}
export interface EventGoodsListResponse {
  items: EventGoodsItem[];
}

// legacy event_board_ps.php goods_option_search/group_search 결과 행(tbl_goods_item).
export interface EventOptionSearchRow {
  product_code: string;
  product_name: string;
  product_name_en: string;
  platform_name: string;
  publisher_name: string;
  game_type_name: string;
  status: string; // "0" 판매중 | "1" 판매중지 | "3" 판매종료 | "9" 승인대기
}
export interface EventOptionSearchResponse {
  items: EventOptionSearchRow[];
}
// group_search는 전체추가용 group_code 동반.
export interface EventGroupSearchResponse {
  group_code: string;
  items: EventOptionSearchRow[];
}

export interface EventGoodsAddRequest {
  event_no: number;
  product_code: string;
  product_name: string;
}

// legacy event_lottery_list.php — AdminEvent::getEventLotteryList (tbl_event_lottery_config, idx desc, 30/page).
export interface EventLotterySearch {
  page: number;
}

// 행별 집계는 백엔드에서 수행(legacy N+1 서브쿼리 대체).
export interface EventLotteryItem {
  idx: number;
  event_name: string;
  event_gift: string; // 사은품
  event_gift_count: number; // 진행수량
  event_start_dt: string; // 이벤트 기간 시작(문자열 그대로)
  event_end_dt: string; // 이벤트 기간 종료
  total: number; // 대상금액 = sum(event_price) (event_per_price 이상 회원)
  member_count: number; // 대상자수
  event_member: number; // 참여자수
  event_count: number; // 참여횟수
  won_count: number; // 당첨자수 = lottery_status='Y' count
}

export interface EventLotteryListResponse {
  items: EventLotteryItem[];
  pagination: EventPagination;
}

// legacy event_lottery_success.php — 추첨 이벤트 당첨자현황
// (AdminEvent::getEventLotteryItemList, lottery_status='Y', lottery_date desc, 30/page).
export interface EventLotterySuccessSearch {
  event_no: number;
  page: number;
  searchTitle: string; // 회원아이디 등호("" = 미적용)
}

// 회원 정보(name/birth_day/hp)는 백엔드 enrich(tbl_member).
export interface EventLotterySuccessItem {
  item_name: string; // 사은품명
  m_id: string; // 회원아이디
  name: string; // 회원명
  birth_day: string; // 생년월일
  hp: string; // 휴대폰번호
  lottery_date: string; // 당첨일자
}

export interface EventLotterySuccessResponse {
  items: EventLotterySuccessItem[];
  event_name: string; // 결과 첫 행 파생(0건이면 "")
  event_start_dt: string;
  event_end_dt: string;
  pagination: EventPagination;
}

// legacy event_list_202505.php — 2025 가정의달 이벤트
// (getEventLotteryList, idx in 29~33 하드코딩, idx desc, 30/page). 사용예산은 빈 셀.
export interface EventCampaign202505Search {
  page: number;
}

export interface EventCampaign202505Item {
  idx: number;
  event_name: string;
  event_gift: string; // 사은품
  event_gift_count: number; // 사은품수량
  event_start_dt: string;
  event_end_dt: string;
  event_member: number; // 참여자수(getEventLotteryJoinCount)
}

export interface EventCampaign202505ListResponse {
  items: EventCampaign202505Item[];
  pagination: EventPagination;
}

// legacy event_list_20250626.php — 2025 여름 프로모션 이벤트
// (getEventLotteryList, idx in 34~37 하드코딩, idx asc, 30/page). 사용예산/합계는 프론트 계산.
export interface EventCampaign20250626Search {
  page: number;
}

export interface EventCampaign20250626Item {
  idx: number;
  event_name: string;
  event_gift: string; // 사은품
  event_gift_count: number; // 사은품수량
  event_start_dt: string;
  event_end_dt: string;
  event_member: number; // 참여자수(getEventMemberCount, tbl_event_log)
  event_per_price: number; // 예산 단가(사용예산 계산용)
}

export interface EventCampaign20250626ListResponse {
  items: EventCampaign20250626Item[];
  pagination: EventPagination;
}

// legacy event_fm26.php — 풋볼 매니저 26 예약 구매 이벤트
// (getEventLotteryList, idx in 38~39 하드코딩, idx asc, 30/page). 사용예산은 event_gift_count>0 조건.
export interface EventFm26Search {
  page: number;
}

export interface EventFm26Item {
  idx: number;
  event_name: string;
  event_gift: string; // 사은품
  event_gift_count: number; // 사은품수량
  event_start_dt: string;
  event_end_dt: string;
  event_member: number; // 참여자수(getEventMemberCount, tbl_event_log)
  event_per_price: number; // 예산 단가(사용예산 계산용)
}

export interface EventFm26ListResponse {
  items: EventFm26Item[];
  pagination: EventPagination;
}

// legacy event_gift_list.php — 사은품 이벤트 진행이력 (getEventGiftList, tbl_event_gift, idx desc, 30/page).
export interface EventGiftSearch {
  page: number;
}

export interface EventGiftItem {
  idx: number;
  title: string; // 이벤트명
  gift_nm: string; // 사은품명
  gift_count: number; // 사은품수량
  start_dt: string;
  end_dt: string;
  event_m_date: string; // 당첨자발표
  delivery_date: string; // 사은품발송
  is_delivery: string; // 배송여부(raw)
}

export interface EventGiftListResponse {
  items: EventGiftItem[];
  pagination: EventPagination;
}

// legacy event_gift_member.php — 사은품 이벤트 당첨자현황
// (getEventMemberList, tbl_event_gift_member ⋈ tbl_event_gift, reg_date desc, 30/page).
export interface EventGiftMemberSearch {
  idx: number; // parent_idx
  page: number;
  searchTitle: string; // 회원아이디 등호("" = 미적용)
}

// 회원 정보(name/birth_day/hp)는 백엔드 enrich(tbl_member).
export interface EventGiftMemberItem {
  gift_nm: string; // 사은품명
  m_id: string; // 회원아이디
  name: string; // 회원명
  birth_day: string; // 생년월일
  hp: string; // 배송 X 휴대폰번호(member.hp)
  tel: string; // 배송 O 휴대폰번호(tegm.tel)
  receiver: string; // 수신인(배송 O)
  zipcode: string; // 배송 O
  address: string; // 배송 O
  address_detail: string; // 배송 O
  reg_date: string; // 배송지입력일자 / 수령시간
  status: number; // 0~3
  tracking_no: string; // 송장번호(배송 O)
  delivery_code: string; // 택배사 코드(배송 O)
  asset_id: string; // 배송 X
}

export interface EventGiftMemberResponse {
  items: EventGiftMemberItem[];
  title: string; // 결과 첫 행 파생(0건이면 "")
  is_delivery: string; // "Y"=배송 O 레이아웃, else 배송 X
  start_dt: string;
  end_dt: string;
  pagination: EventPagination;
}

// legacy event_gift_member.php $event_status_arr
export const EVENT_GIFT_STATUS: Record<number, string> = {
  0: "",
  1: "배송지입력",
  2: "발송완료",
  3: "수령완료",
};

// legacy event_gift_request.php — 사은품 발송 현황
// (getEventMemberList, is_delivery='Y' 고정 + 검색필터, reg_date desc, 30/page).
export interface EventGiftRequestSearch {
  page: number;
  search_type: string; // "tegm.m_id" | "tegm.tracking_no" | "tegm.receiver"
  search_value: string;
  status: string; // "all" | "1" | "2"
  event_gift_idx: string; // "" | parent_idx
}

export interface EventGiftRequestItem {
  title: string; // 이벤트명
  gift_nm: string; // 사은품명
  m_id: string; // 회원아이디
  name: string; // 회원명(enrich)
  birth_day: string; // 생년월일(enrich)
  tel: string; // 휴대폰번호(tegm.tel)
  receiver: string; // 수신인
  zipcode: string;
  address: string;
  address_detail: string;
  reg_date: string; // 배송지입력일자
  status: number; // 0~3
  tracking_no: string; // 송장번호
  delivery_code: string; // 택배사 코드
}

// legacy getEventGiftList2 — 이벤트/사은품 명 드롭다운 옵션.
export interface EventGiftOption {
  idx: number;
  title: string;
  gift_nm: string;
}

export interface EventGiftRequestListResponse {
  items: EventGiftRequestItem[];
  event_gift_options: EventGiftOption[];
  pagination: EventPagination;
}

// legacy event_point_list.php — 포인트 지급 이벤트
// (getEventPointList, MAIN DB tbl_add_repay ⋈ tbl_goods_item, start_dt/end_dt desc, 30/page).
export interface EventPointSearch {
  page: number;
  search_flag: string; // "" | "Y" | "N"
  search_status: string; // "" | "upcoming" | "ing" | "end"
  search_key: string; // "search_name" | "search_product_code"
  search_value: string;
}

export interface EventPointItem {
  idx: number;
  product_code: string;
  product_name: string;
  repay_flag: string; // 지급여부(raw)
  start_dt: string;
  end_dt: string;
  repay_type: string; // "%" | 그 외 단위
  repay_point: number;
}

export interface EventPointListResponse {
  items: EventPointItem[];
  pagination: EventPagination;
}

// legacy event_board_list.php $event_gubun_text
export const EVENT_GUBUN_TEXT: Record<string, string> = {
  "1": "예약구매",
  "2": "네이버페이 즉시할인",
  "3": "토스 즉시할인",
  "4": "네이버페이 포인트 쿠폰",
  "5": "당첨자발표",
  "6": "DGKR 포인트",
};
