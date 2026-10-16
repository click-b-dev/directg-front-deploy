import { apiClient } from "@shared/api/client";
import type {
  ChinaInvoiceListSearch,
  ChinaInvoiceListResponse,
  ChinaMemberListSearch,
  ChinaMemberListResponse,
  ChinaMemberPwdResetRequest,
  ChinaMemberPwdResetResult,
  ChinaMemberRegisterRequest,
  ChinaMemberRegisterResult,
  ChinaGoodsListSearch,
  ChinaGoodsListResponse,
  ChinaGoodsSaveRequest,
  ChinaGoodsSaveResult,
  ChinaGoodsDeleteRequest,
  ChinaGoodsDeleteResult,
  ChinaMemberAllResponse,
  ChinaGoodsSearchQuery,
  ChinaGoodsSearchResponse,
  ChinaOrderRegisterRequest,
  ChinaOrderRegisterResult,
  ChinaOrderDeleteRequest,
  ChinaOrderDeleteResult,
  ChinaSalesYearResponse,
  ChinaSalesMonthSearch,
  ChinaSalesMonthResponse,
  ChinaOrderMonthSearch,
  ChinaOrderMonthResponse,
  ChinaOrderDetailResponse,
  ChinaOrderModifyRequest,
  ChinaOrderModifyResult,
} from "../model/types";

// legacy china/invoice_list.php — 중국 결제완료 목록.
export const fetchChinaInvoiceList = (query: ChinaInvoiceListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof ChinaInvoiceListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_year", query.search_year);
  set("search_settle_no", query.search_settle_no);
  set("search_name", query.search_name);
  set("search_email", query.search_email);
  return apiClient.get<ChinaInvoiceListResponse>("/admin/china/invoices", { searchParams });
};

// legacy china/invoice_member.php — 중국 결제자 목록.
export const fetchChinaMemberList = (query: ChinaMemberListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof ChinaMemberListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_name", query.search_name);
  set("search_email", query.search_email);
  return apiClient.get<ChinaMemberListResponse>("/admin/china/members", { searchParams });
};

// legacy invoice_member_ps.php mode=pwd_reset — 비밀번호 초기화.
export const resetChinaMemberPwd = (payload: ChinaMemberPwdResetRequest) =>
  apiClient.post<ChinaMemberPwdResetResult>("/admin/china/members/pwd-reset", payload);

// legacy invoice_member_ps.php mode=register — 결제자 등록.
export const createChinaMember = (payload: ChinaMemberRegisterRequest) =>
  apiClient.post<ChinaMemberRegisterResult>("/admin/china/members", payload);

// legacy china/invoice_goods.php — 중국 결제 상품 목록.
export const fetchChinaGoodsList = (query: ChinaGoodsListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof ChinaGoodsListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_name", query.search_name);
  set("search_platform", query.search_platform);
  return apiClient.get<ChinaGoodsListResponse>("/admin/china/goods", { searchParams });
};

// legacy invoice_goods_ps.php mode=register|modify — 상품 등록/수정.
export const saveChinaGoods = (payload: ChinaGoodsSaveRequest) =>
  apiClient.post<ChinaGoodsSaveResult>("/admin/china/goods", payload);

// legacy invoice_goods_ps.php mode=delete — 상품 삭제.
export const deleteChinaGoods = (payload: ChinaGoodsDeleteRequest) =>
  apiClient.post<ChinaGoodsDeleteResult>("/admin/china/goods/delete", payload);

// legacy invoice_register.php — 결제자 전체(모달용, idx desc).
export const fetchChinaMemberAll = () =>
  apiClient.get<ChinaMemberAllResponse>("/admin/china/members/all");

// legacy invoice_goods_ps.php mode=invoice_goods_search — 주문상품 검색.
export const fetchChinaGoodsSearch = (query: ChinaGoodsSearchQuery) =>
  apiClient.get<ChinaGoodsSearchResponse>("/admin/china/goods/search", {
    searchParams: { search_platform: query.search_platform, search_value: query.search_value },
  });

// legacy invoice_ps.php mode=register — 주문서 등록.
export const createChinaOrder = (payload: ChinaOrderRegisterRequest) =>
  apiClient.post<ChinaOrderRegisterResult>("/admin/china/orders", payload);

// legacy china/invoice_request.php — 결제요청(결제대기) 목록. #218과 동일 shape 재사용.
export const fetchChinaRequestList = (query: ChinaInvoiceListSearch) => {
  const searchParams: Record<string, string> = {};
  const set = (key: keyof ChinaInvoiceListSearch, value: string | number | undefined) => {
    if (value !== undefined && value !== "") {
      searchParams[key] = String(value);
    }
  };
  set("page", query.page);
  set("search_year", query.search_year);
  set("search_settle_no", query.search_settle_no);
  set("search_name", query.search_name);
  set("search_email", query.search_email);
  return apiClient.get<ChinaInvoiceListResponse>("/admin/china/requests", { searchParams });
};

// legacy invoice_ps.php mode=invoice_delete — 주문서 삭제(order + item).
export const deleteChinaOrder = (payload: ChinaOrderDeleteRequest) =>
  apiClient.post<ChinaOrderDeleteResult>("/admin/china/orders/delete", payload);

// legacy china/sales_china_year.php — 중국 누적매출 현황(연도×지역 매트릭스).
export const fetchChinaSalesYear = () =>
  apiClient.get<ChinaSalesYearResponse>("/admin/china/sales/year");

// legacy china/sales_china_month.php — 중국 월별매출 현황(선택연도 월×지역 매트릭스).
export const fetchChinaSalesMonth = (query: ChinaSalesMonthSearch) =>
  apiClient.get<ChinaSalesMonthResponse>("/admin/china/sales/month", {
    searchParams: query.search_year ? { search_year: query.search_year } : {},
  });

// legacy china/order_china_month.php — 중국 월별주문 현황(타이틀별 × 지역별 수량/금액).
export const fetchChinaOrderMonth = (query: ChinaOrderMonthSearch) => {
  const searchParams: Record<string, string> = {};
  if (query.search_year) searchParams.search_year = query.search_year;
  if (query.search_month) searchParams.search_month = query.search_month;
  return apiClient.get<ChinaOrderMonthResponse>("/admin/china/orders/month", { searchParams });
};

// legacy china/invoice_view.php — 주문서 상세보기(order/items/logs/address).
export const fetchChinaOrderDetail = (settleNo: string) =>
  apiClient.get<ChinaOrderDetailResponse>("/admin/china/orders/detail", {
    searchParams: { settle_no: settleNo },
  });

// legacy china/invoice_modify.php + invoice_ps.php mode=modify — 주문 헤더 수정.
export const modifyChinaOrder = (payload: ChinaOrderModifyRequest) =>
  apiClient.post<ChinaOrderModifyResult>("/admin/china/orders/modify", payload);
