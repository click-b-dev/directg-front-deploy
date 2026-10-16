import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchChinaInvoiceList,
  fetchChinaMemberList,
  resetChinaMemberPwd,
  createChinaMember,
  fetchChinaGoodsList,
  saveChinaGoods,
  deleteChinaGoods,
  fetchChinaMemberAll,
  fetchChinaGoodsSearch,
  createChinaOrder,
  fetchChinaRequestList,
  deleteChinaOrder,
  fetchChinaSalesYear,
  fetchChinaSalesMonth,
  fetchChinaOrderMonth,
  fetchChinaOrderDetail,
  modifyChinaOrder,
} from "./fetcher";
import type {
  ChinaInvoiceListSearch,
  ChinaMemberListSearch,
  ChinaMemberPwdResetRequest,
  ChinaMemberRegisterRequest,
  ChinaGoodsListSearch,
  ChinaGoodsSaveRequest,
  ChinaGoodsDeleteRequest,
  ChinaGoodsSearchQuery,
  ChinaOrderRegisterRequest,
  ChinaOrderDeleteRequest,
  ChinaSalesMonthSearch,
  ChinaOrderMonthSearch,
  ChinaOrderModifyRequest,
} from "../model/types";

const CHINA_KEY = ["admin", "china"] as const;
const CHINA_MEMBER_KEY = [...CHINA_KEY, "members"] as const;
const CHINA_GOODS_KEY = [...CHINA_KEY, "goods"] as const;
const CHINA_REQUEST_KEY = [...CHINA_KEY, "requests"] as const;

export const chinaInvoiceListQueryKey = (query: ChinaInvoiceListSearch) =>
  [...CHINA_KEY, "invoices", query] as const;

// legacy china/invoice_list.php — 중국 결제완료 리스트.
export const useChinaInvoiceList = (query: ChinaInvoiceListSearch) =>
  useQuery({
    queryKey: chinaInvoiceListQueryKey(query),
    queryFn: () => fetchChinaInvoiceList(query),
  });

export const chinaMemberListQueryKey = (query: ChinaMemberListSearch) =>
  [...CHINA_MEMBER_KEY, query] as const;

// legacy china/invoice_member.php — 중국 결제자 리스트.
export const useChinaMemberList = (query: ChinaMemberListSearch) =>
  useQuery({
    queryKey: chinaMemberListQueryKey(query),
    queryFn: () => fetchChinaMemberList(query),
  });

// legacy invoice_member_ps.php mode=pwd_reset → //location.reload() 주석 = invalidate 없음(quirk).
export const useResetChinaMemberPwd = () =>
  useMutation({
    mutationFn: (p: ChinaMemberPwdResetRequest) => resetChinaMemberPwd(p),
  });

// legacy invoice_member_ps.php mode=register → go(invoice_member.php) 리다이렉트 = 목록 invalidate.
export const useCreateChinaMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: ChinaMemberRegisterRequest) => createChinaMember(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHINA_MEMBER_KEY }),
  });
};

export const chinaGoodsListQueryKey = (query: ChinaGoodsListSearch) =>
  [...CHINA_GOODS_KEY, query] as const;

// legacy china/invoice_goods.php — 중국 결제 상품 리스트.
export const useChinaGoodsList = (query: ChinaGoodsListSearch) =>
  useQuery({
    queryKey: chinaGoodsListQueryKey(query),
    queryFn: () => fetchChinaGoodsList(query),
  });

// legacy invoice_goods_ps.php register/modify → window.location.reload() = 목록 invalidate.
export const useSaveChinaGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: ChinaGoodsSaveRequest) => saveChinaGoods(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHINA_GOODS_KEY }),
  });
};

// legacy invoice_goods_ps.php delete → window.location.reload() = 목록 invalidate.
export const useDeleteChinaGoods = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: ChinaGoodsDeleteRequest) => deleteChinaGoods(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHINA_GOODS_KEY }),
  });
};

// legacy invoice_register.php — 결제자 전체(모달용, idx desc).
export const useChinaMemberAll = () =>
  useQuery({
    queryKey: [...CHINA_MEMBER_KEY, "all"] as const,
    queryFn: () => fetchChinaMemberAll(),
  });

// legacy invoice_goods_ps.php mode=invoice_goods_search — 주문상품 검색(버튼 클릭 시 on-demand).
export const useChinaGoodsSearch = () =>
  useMutation({
    mutationFn: (q: ChinaGoodsSearchQuery) => fetchChinaGoodsSearch(q),
  });

// legacy invoice_ps.php mode=register — 주문서 등록.
export const useCreateChinaOrder = () =>
  useMutation({
    mutationFn: (p: ChinaOrderRegisterRequest) => createChinaOrder(p),
  });

export const chinaRequestListQueryKey = (query: ChinaInvoiceListSearch) =>
  [...CHINA_REQUEST_KEY, query] as const;

// legacy china/invoice_request.php — 중국 결제요청(결제대기) 리스트.
export const useChinaRequestList = (query: ChinaInvoiceListSearch) =>
  useQuery({
    queryKey: chinaRequestListQueryKey(query),
    queryFn: () => fetchChinaRequestList(query),
  });

// legacy invoice_ps.php mode=invoice_delete → window.location.reload() = 목록 invalidate.
export const useDeleteChinaOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (p: ChinaOrderDeleteRequest) => deleteChinaOrder(p),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHINA_REQUEST_KEY }),
  });
};

// legacy china/sales_china_year.php — 중국 누적매출 현황.
export const useChinaSalesYear = () =>
  useQuery({
    queryKey: [...CHINA_KEY, "sales", "year"] as const,
    queryFn: () => fetchChinaSalesYear(),
  });

// legacy china/sales_china_month.php — 중국 월별매출 현황.
export const useChinaSalesMonth = (query: ChinaSalesMonthSearch) =>
  useQuery({
    queryKey: [...CHINA_KEY, "sales", "month", query] as const,
    queryFn: () => fetchChinaSalesMonth(query),
  });

// legacy china/order_china_month.php — 중국 월별주문 현황.
export const useChinaOrderMonth = (query: ChinaOrderMonthSearch) =>
  useQuery({
    queryKey: [...CHINA_KEY, "orders", "month", query] as const,
    queryFn: () => fetchChinaOrderMonth(query),
  });

// legacy china/invoice_view.php — 주문서 상세보기(settle_no 있을 때만).
export const useChinaOrderDetail = (settleNo: string) =>
  useQuery({
    queryKey: [...CHINA_KEY, "orders", "detail", settleNo] as const,
    queryFn: () => fetchChinaOrderDetail(settleNo),
    enabled: settleNo !== "",
  });

// legacy china/invoice_modify.php — 주문 헤더 수정.
export const useModifyChinaOrder = () =>
  useMutation({
    mutationFn: (p: ChinaOrderModifyRequest) => modifyChinaOrder(p),
  });
