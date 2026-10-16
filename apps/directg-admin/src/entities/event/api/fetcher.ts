import { apiClient } from "@shared/api/client";
import type {
  EventBoardSearch,
  EventBoardListResponse,
  EventBoardDetail,
  EventBoardSaveRequest,
  EventBoardActionResult,
  EventGoodsListResponse,
  EventOptionSearchResponse,
  EventGroupSearchResponse,
  EventGoodsAddRequest,
  EventLotterySearch,
  EventLotteryListResponse,
  EventLotterySuccessSearch,
  EventLotterySuccessResponse,
  EventCampaign202505Search,
  EventCampaign202505ListResponse,
  EventCampaign20250626Search,
  EventCampaign20250626ListResponse,
  EventFm26Search,
  EventFm26ListResponse,
  EventGiftSearch,
  EventGiftListResponse,
  EventGiftMemberSearch,
  EventGiftMemberResponse,
  EventGiftRequestSearch,
  EventGiftRequestListResponse,
  EventPointSearch,
  EventPointListResponse,
} from "../model/types";

// legacy event_lottery_list.php — AdminEvent::getEventLotteryList (tbl_event_lottery_config, idx desc, 30/page).
export const fetchEventLotteryList = (query: EventLotterySearch) =>
  apiClient.get<EventLotteryListResponse>("/admin/event/lottery-list", {
    searchParams: { page: String(query.page || 1) },
  });

// legacy event_lottery_success.php — 추첨 이벤트 당첨자현황(lottery_status='Y', lottery_date desc, 30/page).
export const fetchEventLotterySuccess = (query: EventLotterySuccessSearch) => {
  const searchParams: Record<string, string> = {
    event_no: String(query.event_no),
    page: String(query.page || 1),
  };
  if (query.searchTitle) {
    searchParams.searchTitle = query.searchTitle;
  }
  return apiClient.get<EventLotterySuccessResponse>("/admin/event/lottery-success", {
    searchParams,
  });
};

// legacy event_list_202505.php — 2025 가정의달 이벤트(idx 29~33 고정, idx desc, 30/page).
export const fetchEventCampaign202505 = (query: EventCampaign202505Search) =>
  apiClient.get<EventCampaign202505ListResponse>("/admin/event/campaign-202505", {
    searchParams: { page: String(query.page || 1) },
  });

// legacy event_list_20250626.php — 2025 여름 프로모션 이벤트(idx 34~37 고정, idx asc, 30/page).
export const fetchEventCampaign20250626 = (query: EventCampaign20250626Search) =>
  apiClient.get<EventCampaign20250626ListResponse>("/admin/event/campaign-20250626", {
    searchParams: { page: String(query.page || 1) },
  });

// legacy event_fm26.php — 풋볼 매니저 26 예약 구매 이벤트(idx 38~39 고정, idx asc, 30/page).
export const fetchEventFm26 = (query: EventFm26Search) =>
  apiClient.get<EventFm26ListResponse>("/admin/event/campaign-fm26", {
    searchParams: { page: String(query.page || 1) },
  });

// legacy event_gift_list.php — 사은품 이벤트 진행이력(tbl_event_gift, idx desc, 30/page).
export const fetchEventGiftList = (query: EventGiftSearch) =>
  apiClient.get<EventGiftListResponse>("/admin/event/gift-list", {
    searchParams: { page: String(query.page || 1) },
  });

// legacy event_gift_member.php — 사은품 이벤트 당첨자현황(parent_idx=idx, reg_date desc, 30/page).
export const fetchEventGiftMember = (query: EventGiftMemberSearch) => {
  const searchParams: Record<string, string> = {
    idx: String(query.idx),
    page: String(query.page || 1),
  };
  if (query.searchTitle) {
    searchParams.searchTitle = query.searchTitle;
  }
  return apiClient.get<EventGiftMemberResponse>("/admin/event/gift-member", { searchParams });
};

// legacy event_gift_request.php — 사은품 발송 현황(is_delivery='Y' 고정 + 검색필터, reg_date desc, 30/page).
export const fetchEventGiftRequest = (query: EventGiftRequestSearch) => {
  const searchParams: Record<string, string> = {
    page: String(query.page || 1),
    status: query.status || "all",
  };
  if (query.search_type) {
    searchParams.search_type = query.search_type;
  }
  if (query.search_value) {
    searchParams.search_value = query.search_value;
  }
  if (query.event_gift_idx) {
    searchParams.event_gift_idx = query.event_gift_idx;
  }
  return apiClient.get<EventGiftRequestListResponse>("/admin/event/gift-request", { searchParams });
};

// legacy event_point_list.php — 포인트 지급 이벤트(MAIN DB, start_dt/end_dt desc, 30/page).
export const fetchEventPointList = (query: EventPointSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page || 1) };
  if (query.search_flag) {
    searchParams.search_flag = query.search_flag;
  }
  if (query.search_status) {
    searchParams.search_status = query.search_status;
  }
  if (query.search_value) {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  return apiClient.get<EventPointListResponse>("/admin/event/point-list", { searchParams });
};

// legacy event_board_list.php — AdminBoard::getEventList (tbl_event, is_view desc·start_date desc, 10/page).
export const fetchEventBoardList = (query: EventBoardSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page || 1) };
  if (query.is_view) {
    searchParams.is_view = query.is_view;
  }
  return apiClient.get<EventBoardListResponse>("/admin/event/board-list", { searchParams });
};

// legacy event_board_register.php(idx>0) — tbl_event 단건(폼 프리필).
export const fetchEventBoardDetail = (idx: number) =>
  apiClient.get<EventBoardDetail>(`/admin/event/board/${idx}`);

// legacy event_board_ps.php mode=register — tbl_event 등록.
export const createEventBoard = (payload: EventBoardSaveRequest) =>
  apiClient.post<EventBoardActionResult>("/admin/event/board", payload);

// legacy event_board_ps.php mode=modify — tbl_event 수정.
export const updateEventBoard = (idx: number, payload: EventBoardSaveRequest) =>
  apiClient.put<EventBoardActionResult>(`/admin/event/board/${idx}`, payload);

// legacy event_board_modify.php — tbl_event_goods(event_no별 이벤트 상품 목록).
export const fetchEventGoods = (eventNo: number) =>
  apiClient.get<EventGoodsListResponse>(`/admin/event/board/${eventNo}/goods`);

// legacy event_board_ps.php mode=goods_option_search — 옵션상품명/코드 검색.
export const searchEventGoodsOption = (searchValue: string, eventNo: number) =>
  apiClient.post<EventOptionSearchResponse>("/admin/event/board/goods/search", {
    search_value: searchValue,
    event_no: eventNo,
  });

// legacy event_board_ps.php mode=group_search — 그룹코드 검색.
export const searchEventGroup = (searchValue: string, eventNo: number) =>
  apiClient.post<EventGroupSearchResponse>("/admin/event/board/goods/group-search", {
    search_value: searchValue,
    event_no: eventNo,
  });

// legacy event_board_ps.php mode=event_goods_add — 이벤트 상품 추가.
export const addEventGoods = (payload: EventGoodsAddRequest) =>
  apiClient.post<EventBoardActionResult>("/admin/event/board/goods", payload);

// legacy event_board_ps.php mode=event_goods_delete — 이벤트 상품 삭제.
export const deleteEventGoods = (idx: number) =>
  apiClient.del<EventBoardActionResult>(`/admin/event/board/goods/${idx}`);

// legacy event_board_ps.php mode=group_item_add — 그룹 상품 전체 추가.
export const addEventGroupItems = (eventNo: number, groupCode: string) =>
  apiClient.post<EventBoardActionResult>("/admin/event/board/goods/group-add", {
    event_no: eventNo,
    group_code: groupCode,
  });
