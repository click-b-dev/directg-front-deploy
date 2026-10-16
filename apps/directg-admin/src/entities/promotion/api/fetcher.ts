import { apiClient } from "@shared/api/client";
import type {
  PromotionReadyListSearch,
  PromotionReadyListResponse,
  PromotionIngListSearch,
  PromotionIngListResponse,
  PromotionUpcomingListSearch,
  PromotionUpcomingListResponse,
  PromotionEndListSearch,
  PromotionEndListResponse,
  PromotionWeekendListSearch,
  PromotionWeekendListResponse,
  PromotionWeekendDetail,
  PromotionWeekendSaveRequest,
  PromotionWeekendView,
  PromotionSeasonListSearch,
  PromotionSeasonListResponse,
  PromotionSeasonDetail,
  PromotionSeasonSaveRequest,
  PromotionSeasonView,
  OfflineCouponListSearch,
  OfflineCouponListResponse,
  OfflineCouponDetail,
  OfflineCouponSaveRequest,
  OfflineCouponViewSearch,
  OfflineCouponUsedResponse,
  PromotionUploadRequest,
  PromotionActionResult,
} from "../model/types";

// legacy promotion/promotion_ready.php — 승인대기 할인 프로모션 목록(confirm='N', 30/page).
export const fetchPromotionReadyList = (query: PromotionReadyListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  return apiClient.get<PromotionReadyListResponse>("/admin/promotion/promotion-ready", {
    searchParams,
  });
};

// legacy promotion/promotion_ing.php — 진행중인 할인 프로모션 목록(진행중 기간 + 검색필터, 30/page).
export const fetchPromotionIngList = (query: PromotionIngListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const set = (key: keyof PromotionIngListSearch, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_confirm", query.search_confirm);
  return apiClient.get<PromotionIngListResponse>("/admin/promotion/promotion-ing", {
    searchParams,
  });
};

// legacy promotion/promotion_upcoming.php — 진행예정 할인 프로모션 목록(미시작 기간 + 검색필터, 30/page).
export const fetchPromotionUpcomingList = (query: PromotionUpcomingListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const set = (key: keyof PromotionUpcomingListSearch, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_confirm", query.search_confirm);
  return apiClient.get<PromotionUpcomingListResponse>("/admin/promotion/promotion-upcoming", {
    searchParams,
  });
};

// legacy promotion/promotion_end.php — 종료된 할인 프로모션 목록(종료 기간 + 검색필터, 읽기전용, 30/page).
export const fetchPromotionEndList = (query: PromotionEndListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const set = (key: keyof PromotionEndListSearch, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  set("search_confirm", query.search_confirm);
  return apiClient.get<PromotionEndListResponse>("/admin/promotion/promotion-end", {
    searchParams,
  });
};

// legacy promotion/promotion_weekend.php — 주말특가 프로모션 목록(이름검색, 30/page).
export const fetchPromotionWeekendList = (query: PromotionWeekendListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const set = (key: keyof PromotionWeekendListSearch, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  return apiClient.get<PromotionWeekendListResponse>("/admin/promotion/promotion-weekend", {
    searchParams,
  });
};

// legacy promotion_weekend_register.php(modify 로드) — 주말특가 상세(프리필).
export const fetchPromotionWeekendDetail = (idx: number) =>
  apiClient.get<PromotionWeekendDetail>(`/admin/promotion/promotion-weekend/${idx}`);

// legacy promotion_weekend_ps.php mode=register — 주말특가 등록.
export const createPromotionWeekend = (payload: PromotionWeekendSaveRequest) =>
  apiClient.post<PromotionActionResult>("/admin/promotion/promotion-weekend", payload);

// legacy promotion_weekend_ps.php mode=modify — 주말특가 수정.
export const updatePromotionWeekend = (idx: number, payload: PromotionWeekendSaveRequest) =>
  apiClient.put<PromotionActionResult>(`/admin/promotion/promotion-weekend/${idx}`, payload);

// legacy promotion_weekend_view.php — 주말특가 상세보기(옵션 resolve 카드 데이터).
export const fetchPromotionWeekendView = (idx: number) =>
  apiClient.get<PromotionWeekendView>(`/admin/promotion/promotion-weekend/${idx}/view`);

// legacy promotion/promotion_season.php — 대규모 프로모션 목록(카드, 30/page).
export const fetchPromotionSeasonList = (query: PromotionSeasonListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const set = (key: keyof PromotionSeasonListSearch, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  set("search_key", query.search_key);
  set("search_value", query.search_value);
  return apiClient.get<PromotionSeasonListResponse>("/admin/promotion/promotion-season", {
    searchParams,
  });
};

// legacy promotion_season_register.php(modify 로드) — 대규모 프로모션 상세(프리필).
export const fetchPromotionSeasonDetail = (idx: number) =>
  apiClient.get<PromotionSeasonDetail>(`/admin/promotion/promotion-season/${idx}`);

// legacy promotion_season_ps.php mode=register — 대규모 프로모션 등록(legacy ,, 버그 수정).
export const createPromotionSeason = (payload: PromotionSeasonSaveRequest) =>
  apiClient.post<PromotionActionResult>("/admin/promotion/promotion-season", payload);

// legacy promotion_season_ps.php mode=modify — 대규모 프로모션 수정.
export const updatePromotionSeason = (idx: number, payload: PromotionSeasonSaveRequest) =>
  apiClient.put<PromotionActionResult>(`/admin/promotion/promotion-season/${idx}`, payload);

// legacy promotion_season_view.php — 대규모 프로모션 상세보기(6섹션 카드 데이터).
export const fetchPromotionSeasonView = (idx: number) =>
  apiClient.get<PromotionSeasonView>(`/admin/promotion/promotion-season/${idx}/view`);

// legacy promotion/offline_coupon_list.php — 오프라인 쿠폰 목록(DGKR, 20/page).
export const fetchOfflineCouponList = (query: OfflineCouponListSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const set = (key: keyof OfflineCouponListSearch, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  set("search_type", query.search_type);
  set("search_value", query.search_value);
  return apiClient.get<OfflineCouponListResponse>("/admin/promotion/offline-coupons", {
    searchParams,
  });
};

// legacy offline_coupon_register.php(update 로드) — 오프라인 쿠폰 상세(프리필).
export const fetchOfflineCouponDetail = (sno: number) =>
  apiClient.get<OfflineCouponDetail>(`/admin/promotion/offline-coupons/${sno}`);

// legacy offline_coupon_ps.php mode=register — 오프라인 쿠폰 등록(currency='원'·status=1·코드생성 백엔드).
export const createOfflineCoupon = (payload: OfflineCouponSaveRequest) =>
  apiClient.post<PromotionActionResult>("/admin/promotion/offline-coupons", payload);

// legacy offline_coupon_ps.php mode=update — 오프라인 쿠폰 수정.
export const updateOfflineCoupon = (sno: number, payload: OfflineCouponSaveRequest) =>
  apiClient.put<PromotionActionResult>(`/admin/promotion/offline-coupons/${sno}`, payload);

// legacy offline_coupon_view.php — 오프라인 쿠폰 상세(기본정보 + 사용현황).
export const fetchOfflineCouponUsed = (query: OfflineCouponViewSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.searchTitle !== "") searchParams.searchTitle = query.searchTitle;
  return apiClient.get<OfflineCouponUsedResponse>(
    `/admin/promotion/offline-coupons/${query.sno}/used`,
    { searchParams },
  );
};

// legacy promotion_ps.php mode=file_register — 엑셀 업로드(확장자 검증·파싱·upsert는 백엔드).
export const uploadPromotionFile = (payload: PromotionUploadRequest) =>
  apiClient.post<PromotionActionResult>("/admin/promotion/promotion-ready/upload", payload);

// legacy promotion_ps.php mode=confirm — confirm='N' 전체 승인(confirm='Y').
export const confirmPromotions = () =>
  apiClient.post<PromotionActionResult>("/admin/promotion/promotion-ready/confirm", {});

// legacy promotion_ps.php mode=delete_all — confirm='N' 전체 삭제.
export const deleteAllPromotions = () =>
  apiClient.del<PromotionActionResult>("/admin/promotion/promotion-ready");

// legacy promotion_ps.php mode=delete — 개별 삭제(idx).
export const deletePromotion = (idx: number) =>
  apiClient.del<PromotionActionResult>(`/admin/promotion/promotion-ready/${idx}`);
