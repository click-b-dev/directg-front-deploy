import { http, HttpResponse } from "msw";
import { env } from "@shared/config/env";
import type {
  OrderPaymentReadyItem,
  OrderPaymentApprovedItem,
  OrderVbankItem,
  OrderAllItem,
  OrderReadyItem,
  OrderSuccessItem,
  OrderCancelRequestItem,
  OrderCancelCompleteItem,
  OrderOldListItem,
  OrderShipmentItem,
  OrderAssetSuccessItem,
  OrderZtormSuccessItem,
  OrderZtormViewInfo,
  OrderGenbaSuccessItem,
  OrderGenbaViewInfo,
  OrderVaultnSuccessItem,
  OrderVaultnViewInfo,
  OrderDetailResponse,
  OrderLicenceResponse,
} from "@entities/order";

const api = (path: string) => `${env.apiBaseUrl}${path}`;

// legacy getOrderPaymentReady/getOrderPaymentApproved: results_per_page=20 (화면이 넘긴 '30' 무시). quirk 이식.
const PER_PAGE = 20;

// 내부 행 = 응답 컬럼 + ord_ymd(기간 필터 전용). legacy tbl_order 재현.
type OrderRow = OrderPaymentReadyItem & { ord_ymd: string };
type ApprovedRow = OrderPaymentApprovedItem & { ord_ymd: string };

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 기본 날짜필터(오늘-2~오늘)에서도 목록이 보이도록 reg_date를 런타임 today 기준으로 생성.
const PG = ["kcp", "naverpay", "payco", "toss", "uplus"];
const METHOD = [
  "SC0010",
  "SC0040",
  "SC0030",
  "SC0060",
  "POINT",
  "PAYCO",
  "toss_bank",
  "samsung",
  "DG0000",
];
const VERSION = ["v2", "v1"];

const buildRows = (): OrderRow[] => {
  const today = new Date();
  const rows: OrderRow[] = [];
  for (let i = 0; i < 25; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i); // 오늘부터 과거로 25일 분산
    const day = ymd(d);
    const seq = 25 - i;
    rows.push({
      reg_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(seq)}${100 + i}`,
      m_id: `user${pad(seq)}@example.com`,
      ip: `1.2.3.${(i * 11) % 255}`,
      pg_provider: PG[i % PG.length],
      payment_method: METHOD[i % METHOD.length],
      total_price: 9900 + i * 1000,
      step: "1",
      version: VERSION[i % VERSION.length],
      is_mobile: i % 2 === 0 ? "N" : "Y",
    });
  }
  // legacy reg_date desc
  return rows.sort((a, b) => (a.reg_date < b.reg_date ? 1 : -1));
};

const rows = buildRows();

// legacy tbl_order step='2'(결제완료) 재현. pg에 uplus(+DG0000→DGKR quirk)·toss_pay 포함, payment_date desc.
const APPROVED_PG = ["kcp", "naverpay", "payco", "toss", "toss_pay", "uplus"];
const APPROVED_METHOD = [
  "SC0010",
  "SC0040",
  "SC0030",
  "SC0060",
  "POINT",
  "PAYCO",
  "toss_pay",
  "DG0000",
];

const buildApprovedRows = (): ApprovedRow[] => {
  const today = new Date();
  const list: ApprovedRow[] = [];
  for (let i = 0; i < 22; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = ymd(d);
    const seq = 22 - i;
    const pg = APPROVED_PG[i % APPROVED_PG.length];
    // uplus는 전액할인(DG0000) PG → payment_method 강제, 그 외는 순환.
    const method = pg === "uplus" ? "DG0000" : APPROVED_METHOD[i % APPROVED_METHOD.length];
    list.push({
      reg_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}A${pad(seq)}${200 + i}`,
      is_mobile: i % 2 === 0 ? "N" : "Y",
      m_id: `buyer${pad(seq)}@example.com`,
      ip: `10.0.0.${(i * 13) % 255}`,
      pg_provider: pg,
      payment_method: method,
      use_emoney: i % 3 === 0 ? 1000 * (i + 1) : 0,
      use_cash: i % 4 === 0 ? 500 : 0,
      total_price: 12900 + i * 1500,
      step: "2",
      payment_date: `${day} ${pad(10 + (i % 10))}:${pad((i * 9) % 60)}:00`,
    });
  }
  // legacy payment_date desc
  return list.sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));
};

const approvedRows = buildApprovedRows();

// legacy tbl_order⋈kcp_log⋈payco_log step='1' 가상계좌 재현. va_date는 payco=Y-m-d/kcp=Y-m-d H:i:s(백엔드 포맷).
type VbankRow = OrderVbankItem & { ord_ymd: string };

const buildVbankRows = (): VbankRow[] => {
  const today = new Date();
  const list: VbankRow[] = [];
  for (let i = 0; i < 15; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = ymd(d);
    const seq = 15 - i;
    const isPayco = i % 3 === 0;
    // 마감시각: 일부는 미래(마감 전), 일부는 과거(마감 지남 → text-danger).
    const deadline = new Date(today);
    deadline.setDate(deadline.getDate() + (i % 2 === 0 ? 3 : -1));
    const deadlineDay = ymd(deadline);
    const vaDate = isPayco ? deadlineDay : `${deadlineDay} 23:59:59`;
    list.push({
      reg_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}VB${pad(seq)}`,
      m_id: `vbankuser${pad(seq)}@example.com`,
      ip: `172.16.0.${(i * 17) % 255}`,
      total_price: 15900 + i * 2000,
      step: i === 4 ? "8" : "1", // 하나는 취소요청(step=8) 오버라이드 확인용
      is_mobile: i % 2 === 0 ? "N" : "Y",
      pg_provider: isPayco ? "payco" : "kcp",
      va_date: vaDate,
    });
  }
  // legacy reg_date desc
  return list.sort((a, b) => (a.reg_date < b.reg_date ? 1 : -1));
};

const vbankRows = buildVbankRows();

// legacy 검색 규칙: settle_no/m_id 등호, pg/method 등호(all 제외), ord_ymd >= start / <= end.
// settle_no·m_id 우선 기간무시는 프론트가 이미 정규화(dates 미전송).
type FilterableRow = {
  settle_no: string;
  m_id: string;
  pg_provider?: string; // vbank는 pg 필터 없음
  payment_method?: string; // vbank는 결제수단 필터 없음
  ord_ymd: string;
};

const applyFilters = <T extends FilterableRow>(list: T[], url: URL): T[] => {
  const settleNo = url.searchParams.get("search_settle_no") || "";
  const mId = url.searchParams.get("search_m_id") || "";
  const pg = url.searchParams.get("search_pg_provider") || "";
  const method = url.searchParams.get("search_payment_method") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (settleNo && row.settle_no !== settleNo) return false;
    if (mId && row.m_id !== mId) return false;
    if (pg && pg !== "all" && row.pg_provider !== pg) return false;
    if (method && method !== "all" && row.payment_method !== method) return false;
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

const paginate = <T extends FilterableRow>(list: T[], url: URL) => {
  const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const filtered = applyFilters(list, url);
  const totalResults = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
  const startIdx = (page - 1) * PER_PAGE;
  // ord_ymd(필터 전용)는 응답에 남아도 무해 — 프론트는 무시(member handler 선례).
  const items = filtered.slice(startIdx, startIdx + PER_PAGE);
  return {
    items,
    pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
  };
};

// legacy tbl_order⋈tbl_order_item 주문통합 재현. order_system/status/delivery_type/is_actv 다양하게.
type OrderAllRow = OrderAllItem & { ord_ymd: string };

const ORDER_SYSTEMS = ["Asset", "Ztorm", "Genba", "Vaultn"];
const PRODUCT_NAMES = [
  "사이버펑크 2077",
  "발더스 게이트 3",
  "엘든 링",
  "스타듀 밸리",
  "발로란트 포인트",
];

const buildOrderAllRows = (): OrderAllRow[] => {
  const today = new Date();
  const list: OrderAllRow[] = [];
  for (let i = 0; i < 26; i += 1) {
    // 앞 6건은 오늘(기본 오늘~오늘 필터에서 보이도록), 이후 하루씩 과거로.
    const d = new Date(today);
    d.setDate(d.getDate() - Math.max(0, i - 5));
    const day = ymd(d);
    const seq = 26 - i;
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}S${pad(seq)}`,
      step: ["1", "2", "9"][i % 3],
      ordno: `ORD2026${pad(seq)}${300 + i}`,
      m_id: `orderuser${pad(seq)}@example.com`,
      ip: `192.168.0.${(i * 7) % 255}`,
      product_code: `GOPT${1000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      is_mobile: i % 2 === 0 ? "N" : "Y",
      price: 19900 + i * 3000,
      status: ["1", "2", "3", "4", "5", "6", "8", "9"][i % 8],
      is_actv: i % 4 === 0 ? "0" : "1",
      delivery_type: ["1", "2", "3"][i % 3],
      order_system: ORDER_SYSTEMS[i % ORDER_SYSTEMS.length],
    });
  }
  // legacy order_date desc
  return list.sort((a, b) => (a.order_date < b.order_date ? 1 : -1));
};

const orderAllRows = buildOrderAllRows();

// legacy order_all.php 검색 규칙: search_key별 등호(ordno/settle_no/product_code/m_id),
// order_system 등호(all 제외), order_date(ord_ymd) 범위. search_value 우선 기간무시는 프론트 정규화.
const applyOrderAllFilters = (list: OrderAllRow[], url: URL): OrderAllRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const orderSystem = url.searchParams.get("order_system") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_settle_no" && row.settle_no !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
    }
    if (orderSystem && orderSystem !== "all" && row.order_system !== orderSystem) return false;
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy tbl_order⋈tbl_order_item step=2·send_status=fail·status=1(재처리 대기) 재현. 검색필터 없음.
const buildOrderReadyRows = (): OrderReadyItem[] => {
  const today = new Date();
  const list: OrderReadyItem[] = [];
  for (let i = 0; i < 8; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const day = ymd(d);
    const seq = 8 - i;
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}R${pad(seq)}`,
      ordno: `ORD2026R${pad(seq)}${400 + i}`,
      m_id: `readyuser${pad(seq)}@example.com`,
      product_code: `GOPT${2000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      is_mobile: i % 2 === 0 ? "N" : "Y",
      price: 22900 + i * 2500,
      status: "1", // SQL b.status='1' 고정 → getOrderStatus(1)=주문대기
      delivery_type: ["1", "2", "3"][i % 3],
    });
  }
  // legacy order_date desc
  return list.sort((a, b) => (a.order_date < b.order_date ? 1 : -1));
};

const orderReadyRows = buildOrderReadyRows();

// legacy tbl_order_item status='2' 주문완료 재현. order_system에 ""(연동없음)·PointNexus 포함(bg-danger·none 필터 확인).
type OrderSuccessRow = OrderSuccessItem & { ord_ymd: string };

const SUCCESS_SYSTEMS = ["Asset", "Ztorm", "Genba", "Vaultn", "PointNexus", ""];

const buildOrderSuccessRows = (): OrderSuccessRow[] => {
  const today = new Date();
  const list: OrderSuccessRow[] = [];
  for (let i = 0; i < 24; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - Math.max(0, i - 5));
    const day = ymd(d);
    const seq = 24 - i;
    const orderSystem = SUCCESS_SYSTEMS[i % SUCCESS_SYSTEMS.length];
    const deliveryType = ["1", "2", "3"][i % 3];
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}SC${pad(seq)}`,
      ordno: `ORD2026SC${pad(seq)}${500 + i}`,
      m_id: `successuser${pad(seq)}@example.com`,
      ip: `203.0.113.${(i * 7) % 255}`,
      product_code: `GOPT${3000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      price: 24900 + i * 3000,
      status: "2", // SQL status='2' 고정
      is_actv: i % 3 === 0 ? "0" : "1",
      delivery_type: deliveryType,
      order_system: orderSystem,
    });
  }
  // legacy order_date desc
  return list.sort((a, b) => (a.order_date < b.order_date ? 1 : -1));
};

const orderSuccessRows = buildOrderSuccessRows();

// legacy tbl_order⋈tbl_order_item status IN(7,8) 취소요청 재현. 기본 전체기간(날짜 필터 없이 전체 표시).
type OrderCancelRequestRow = OrderCancelRequestItem & { ord_ymd: string };

const buildOrderCancelRequestRows = (): OrderCancelRequestRow[] => {
  const today = new Date();
  const list: OrderCancelRequestRow[] = [];
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 2);
    const day = ymd(d);
    const seq = 14 - i;
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}CR${pad(seq)}`,
      ordno: `ORD2026CR${pad(seq)}${600 + i}`,
      m_id: `canceluser${pad(seq)}@example.com`,
      product_code: `GOPT${4000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      is_mobile: i % 2 === 0 ? "N" : "Y",
      price: 27900 + i * 2500,
      status: i % 4 === 0 ? "7" : "8", // 7=미매칭 빈셀 / 8=취소요청
      delivery_type: ["1", "2", "3"][i % 3],
    });
  }
  // legacy order_date desc
  return list.sort((a, b) => (a.order_date < b.order_date ? 1 : -1));
};

const orderCancelRequestRows = buildOrderCancelRequestRows();

// legacy tbl_order⋈tbl_order_item status='9' 취소완료 재현. cancel_date/ord_ymd/order_date(정렬용) 보유.
type OrderCancelCompleteRow = OrderCancelCompleteItem & { order_date_sort: string };

const buildOrderCancelCompleteRows = (): OrderCancelCompleteRow[] => {
  const today = new Date();
  const list: OrderCancelCompleteRow[] = [];
  for (let i = 0; i < 30; i += 1) {
    // 구매일은 과거로 분산, 취소완료일은 구매일 며칠 뒤(이번달 범위에 걸치도록).
    const ordered = new Date(today);
    ordered.setDate(ordered.getDate() - (i + 5));
    const canceled = new Date(ordered);
    canceled.setDate(canceled.getDate() + 3);
    const ordDay = ymd(ordered);
    const cancelDay = ymd(canceled);
    const seq = 30 - i;
    list.push({
      cancel_date: `${cancelDay} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: ordDay,
      order_date_sort: `${ordDay} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      settle_no: `2026${pad(ordered.getMonth() + 1)}${pad(ordered.getDate())}CC${pad(seq)}`,
      ordno: `ORD2026CC${pad(seq)}${700 + i}`,
      m_id: `cancelcompleteuser${pad(seq)}@example.com`,
      product_code: `GOPT${5000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      is_mobile: i % 2 === 0 ? "N" : "Y",
      price: 29900 + i * 2500,
      status: "9", // SQL status='9' 고정
      delivery_type: ["1", "2", "3"][i % 3],
    });
  }
  return list;
};

const orderCancelCompleteRows = buildOrderCancelCompleteRows();

// legacy DGKR 아카이브 tbl_order_{year} 재현. 연도별 고정 데이터셋(연도로 조회).
const OLD_SETTLEKINDS = ["SC0010", "SC0040", "SC0000", "PAYCO", "naverpay", "DG0000"];
const OLD_STEPS = ["2", "9", "3", "1"];
const OLD_STATUSES = ["2", "9", "8", "0"];

const buildOrderOldListRows = (year: string): OrderOldListItem[] => {
  const list: OrderOldListItem[] = [];
  for (let i = 0; i < 24; i += 1) {
    const month = pad(((i * 3) % 12) + 1);
    const day = pad((i % 27) + 1);
    const ymdStr = `${year}-${month}-${day}`;
    const seq = 24 - i;
    const step = OLD_STEPS[i % OLD_STEPS.length];
    list.push({
      settle_no: `${year}${month}${day}OL${pad(seq)}`,
      ord_ymd: ymdStr,
      ordno: `ORD${year}${pad(seq)}${800 + i}`,
      email: `olduser${pad(seq)}@example.com`,
      product_nm: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      supp_cd: ["1", "4", "5", "2"][i % 4], // 4/5 = 번들 라벨
      tot_pay: 9900 + i * 1500,
      step,
      cdt: `${ymdStr} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      settlekind: OLD_SETTLEKINDS[i % OLD_SETTLEKINDS.length],
      pg_provider: ["kcp", "naverpay", "payco"][i % 3],
      status: OLD_STATUSES[i % OLD_STATUSES.length],
      is_lic_actv: i % 2 === 0 ? "1" : "0",
    });
  }
  // legacy a.ord_ymd DESC
  return list.sort((a, b) => (a.ord_ymd < b.ord_ymd ? 1 : -1));
};

// legacy order_old_list.php 검색 규칙: search_key 등호(settle_no/ordno/product_code/m_id→email). 날짜 없음.
const applyOrderOldListFilters = (list: OrderOldListItem[], url: URL): OrderOldListItem[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  if (!value) return list;
  return list.filter((row) => {
    if (key === "search_settle_no") return row.settle_no === value;
    if (key === "search_ordno") return row.ordno === value;
    if (key === "search_product_code") return false; // mock에 product_code 미보유 → 결과 없음
    if (key === "search_m_id") return row.email === value;
    return true;
  });
};

// legacy order_cancel_complete.php 검색 규칙: search_key 등호, PG/결제수단 등호, date_type별 기간(cancel_date/ord_ymd),
// orderby(cancel_date/order_date) 정렬. mock은 pg_provider/payment_method 데이터가 없어 필터 시 결과 없음(계약 확인용 무해).
const applyOrderCancelCompleteFilters = (
  list: OrderCancelCompleteRow[],
  url: URL,
): OrderCancelCompleteRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const dateType = url.searchParams.get("search_date_type") || "order_date";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  const filtered = list.filter((row) => {
    if (value) {
      if (key === "search_settle_no" && row.settle_no !== value) return false;
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
    }
    // 기간 컬럼: cancel_date면 취소완료일(날짜부분), 아니면 ord_ymd.
    const cmpDate = dateType === "cancel_date" ? row.cancel_date.slice(0, 10) : row.ord_ymd;
    if (start && cmpDate < start) return false;
    if (end && cmpDate > end) return false;
    return true;
  });

  const orderby = url.searchParams.get("search_orderby") || "cancel_date";
  const sortKey = orderby === "order_date" ? "order_date_sort" : "cancel_date";
  return [...filtered].sort((a, b) => (a[sortKey] < b[sortKey] ? 1 : -1));
};

// legacy order_cancel_request.php 검색 규칙: search_key 등호(settle_no/ordno/product_code/m_id), ord_ymd 범위.
const applyOrderCancelRequestFilters = (
  list: OrderCancelRequestRow[],
  url: URL,
): OrderCancelRequestRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      if (key === "search_settle_no" && row.settle_no !== value) return false;
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
    }
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy order_success.php 검색 규칙: search_key 등호, order_system(none=빈값/all 제외), is_actv/delivery_type 등호,
// price 범위, order_date(ord_ymd) 범위. search_value 우선 기간무시는 프론트 정규화.
const applyOrderSuccessFilters = (list: OrderSuccessRow[], url: URL): OrderSuccessRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const orderSystem = url.searchParams.get("order_system") || "";
  const isActv = url.searchParams.get("search_is_actv") || "";
  const deliveryType = url.searchParams.get("search_delivery_type") || "";
  const priceMin = url.searchParams.get("search_price_min") || "";
  const priceMax = url.searchParams.get("search_price_max") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_settle_no" && row.settle_no !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
    }
    if (orderSystem === "none") {
      if (row.order_system !== "") return false;
    } else if (orderSystem && orderSystem !== "all" && row.order_system !== orderSystem) {
      return false;
    }
    if ((isActv === "0" || isActv === "1") && row.is_actv !== isActv) return false;
    if (["1", "2", "3"].includes(deliveryType) && row.delivery_type !== deliveryType) return false;
    if (priceMin !== "" && row.price < Number(priceMin)) return false;
    if (priceMax !== "" && row.price > Number(priceMax)) return false;
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy tbl_order⋈order_item⋈order_shipment step=2·status=2·delivery_type≠1 택배 배송 재현.
type ShipmentRow = OrderShipmentItem & { ord_ymd: string };

const SHIPMENT_PRODUCTS = [
  "닌텐도 스위치 조이콘",
  "PS5 듀얼센스",
  "Xbox 기프트카드 실물",
  "게이밍 마우스패드",
];

const buildOrderShipmentRows = (): ShipmentRow[] => {
  const today = new Date();
  const list: ShipmentRow[] = [];
  for (let i = 0; i < 26; i += 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i * 2); // 지난달~이번달 범위에 분산
    const day = ymd(d);
    const seq = 26 - i;
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      settle_no: `2026${pad(d.getMonth() + 1)}${pad(d.getDate())}SH${pad(seq)}`,
      ordno: `ORD2026SH${pad(seq)}${900 + i}`,
      m_id: `shipuser${pad(seq)}@example.com`,
      product_code: `GOPT${6000 + i}`,
      product_name: SHIPMENT_PRODUCTS[i % SHIPMENT_PRODUCTS.length],
      is_mobile: i % 2 === 0 ? "N" : "Y",
      price: 39000 + i * 5000,
      status: "2",
      shipment_status: ["2", "3", "4", "5", "6"][i % 5],
      send_status: ["대기", "출고요청", "완료"][i % 3], // pending 화면 배송상태 raw 표시용
      is_actv: i % 5 === 0 ? "1" : "0",
      // ready 배송중 전환 mutation 파라미터(백엔드 enrichment)
      pg_provider: ["kcp", "toss", "naverpay"][i % 3],
      escw_yn: i % 2 === 0 ? "Y" : "N",
      tno: `TNO${900 + i}`,
      tracking_no: `1234567${pad(i)}`,
      delivery_code: ["04", "05", "06"][i % 3],
      tracking_number: `1234-5678-${pad(i)}${pad(seq)}`, // shipping 운송장번호(하이픈 포함, 배송조회 시 제거)
      actual_delivery_date: `${day} 18:00:00`, // confirm 구매확정일자
    });
  }
  // legacy order_item_id desc = seq desc(이미 seq 내림차순 생성)
  return list;
};

const orderShipmentRows = buildOrderShipmentRows();

// legacy order_shipment_all.php 검색 규칙: search_key 등호, shipment_status 등호, ord_ymd 범위.
const applyOrderShipmentAllFilters = (list: ShipmentRow[], url: URL): ShipmentRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const status = url.searchParams.get("search_shipment_status") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      if (key === "search_settle_no" && row.settle_no !== value) return false;
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
    }
    if (status && status !== "all" && row.shipment_status !== status) return false;
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy order_shipment_ready.php: switch case "settle_no" 오타 → search_settle_no 필터 무효(전체 반환) 버그 재현.
const applyOrderShipmentReadyFilters = (list: ShipmentRow[], url: URL): ShipmentRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      // search_settle_no는 legacy case 오타로 필터되지 않음(전체 반환 버그).
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
    }
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy tbl_order_item_asset(asset_id>0) Asset 주문완료 재현. asset_type에 임시코드(bg-danger) 포함.
type AssetSuccessRow = OrderAssetSuccessItem & { ord_ymd: string };

const ASSET_TYPES = ["정식코드", "임시코드", "정식코드", "번들코드"];
const ASSET_PUBLISHERS = ["CD PROJEKT", "Rockstar", "EA", "Ubisoft"];

const buildOrderAssetSuccessRows = (): AssetSuccessRow[] => {
  const today = new Date();
  const list: AssetSuccessRow[] = [];
  for (let i = 0; i < 22; i += 1) {
    // 앞 6건 오늘(기본 오늘~오늘 필터), 이후 과거로.
    const d = new Date(today);
    d.setDate(d.getDate() - Math.max(0, i - 5));
    const day = ymd(d);
    const seq = 22 - i;
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      ordno: `ORD2026AS${pad(seq)}${100 + i}`,
      m_id: `assetuser${pad(seq)}@example.com`,
      m_no: String(200000 + i),
      product_code: `GOPT${7000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      asset_id: String(5000 + i),
      asset_name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]} Steam Key`,
      asset_type: ASSET_TYPES[i % ASSET_TYPES.length],
      asset_publisher: ASSET_PUBLISHERS[i % ASSET_PUBLISHERS.length],
      reserve_id: `RSV-2026-${pad(seq)}`,
    });
  }
  // legacy idx desc = seq 내림차순(이미 그렇게 생성)
  return list;
};

const orderAssetSuccessRows = buildOrderAssetSuccessRows();

// legacy order_asset_success.php 검색 규칙: search_key 등호(ordno/asset_id/m_id/product_code), ord_ymd 범위.
const applyOrderAssetSuccessFilters = (list: AssetSuccessRow[], url: URL): AssetSuccessRow[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_asset_id" && row.asset_id !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
    }
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy tbl_order_item_ztorm(ztorm_item_id>0) Ztorm 주문완료 재현.
type ZtormSuccessRow = OrderZtormSuccessItem & { ord_ymd: string };

const ZTORM_PUBLISHERS = ["CD PROJEKT", "Rockstar", "EA", "Ubisoft"];

const buildOrderZtormSuccessRows = (): ZtormSuccessRow[] => {
  const today = new Date();
  const list: ZtormSuccessRow[] = [];
  for (let i = 0; i < 22; i += 1) {
    // 앞 6건 오늘(기본 이번달 필터에 포함), 이후 과거로.
    const d = new Date(today);
    d.setDate(d.getDate() - Math.max(0, i - 5));
    const day = ymd(d);
    const seq = 22 - i;
    list.push({
      order_date: `${day} ${pad(9 + (i % 12))}:${pad((i * 7) % 60)}:00`,
      ord_ymd: day,
      ordno: `ORD2026ZT${pad(seq)}${100 + i}`,
      m_id: `ztormuser${pad(seq)}@example.com`,
      product_code: `GOPT${7000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      ztorm_item_id: String(88000 + i),
      ztorm_item_name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]} (Ztorm)`,
      ztorm_publisher: ZTORM_PUBLISHERS[i % ZTORM_PUBLISHERS.length],
      customer_product_id: `CPID-${pad(seq)}-${100 + i}`,
    });
  }
  // legacy idx desc = seq 내림차순(이미 그렇게 생성)
  return list;
};

const orderZtormSuccessRows = buildOrderZtormSuccessRows();

// legacy order_ztorm_success.php 검색 규칙: ordno/ztorm_item_id/m_id 등호, ord_ymd 범위.
const applyOrderZtormSuccessFilters = (list: ZtormSuccessRow[], url: URL): ZtormSuccessRow[] => {
  const ordno = url.searchParams.get("search_ordno") || "";
  const ztormId = url.searchParams.get("search_ztorm_id") || "";
  const mId = url.searchParams.get("search_m_id") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (ordno && row.ordno !== ordno) return false;
    if (ztormId && row.ztorm_item_id !== ztormId) return false;
    if (mId && row.m_id !== mId) return false;
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy ztorm_order_view.php: item_order_id면 customer_product_id→ordno 역인덱스, 아니면 ordno 그대로.
// 그 ordno로 Ztorm GetOrder(외부 API) 조회. mock은 ztorm 주문완료 행에서 파생.
const resolveZtormViewOrdno = (searchType: string, searchValue: string): string => {
  if (searchType === "item_order_id") {
    const row = orderZtormSuccessRows.find((r) => r.customer_product_id === searchValue);
    return row ? row.ordno : "0";
  }
  return searchValue;
};

const buildZtormViewInfo = (ordno: string): OrderZtormViewInfo | null => {
  const row = orderZtormSuccessRows.find((r) => r.ordno === ordno);
  if (!row) return null;
  const exVat = 45000 + (Number(row.ztorm_item_id) % 5) * 1000;
  return {
    country_code: "KR",
    customer_ip: "203.0.113.10",
    end_time: `${row.ord_ymd} 14:33:02`,
    is_test: "0",
    is_refund: "0",
    retailer_customer_id: row.m_id,
    retailer_order_id: row.ordno,
    customer_product_id: row.customer_product_id,
    is_refunded: "false",
    product_id: row.ztorm_item_id,
    product_price_ex_vat_value: exVat,
    product_price_ex_vat_currency: "KRW",
    product_price_inc_vat_value: Math.round(exVat * 1.1),
    product_price_inc_vat_currency: "KRW",
    vat_percent: "10",
  };
};

// legacy tbl_order_item_genba(product_code>0) Genba 주문완료 재현. State 0(품절)→bg-danger.
const GENBA_PLATFORMS = ["Steam", "Origin", "Uplay", "Epic"];
const GENBA_PUBLISHERS = ["CD PROJEKT", "Rockstar", "EA", "Ubisoft"];
const GENBA_STATES = ["2", "1", "0", "2"];

const buildOrderGenbaSuccessRows = (): OrderGenbaSuccessItem[] => {
  const today = new Date();
  const list: OrderGenbaSuccessItem[] = [];
  for (let i = 0; i < 22; i += 1) {
    // 앞 6건 오늘(기본 이번달 필터에 포함), 이후 과거로.
    const d = new Date(today);
    d.setDate(d.getDate() - Math.max(0, i - 5));
    const day = ymd(d);
    const seq = 22 - i;
    list.push({
      ordno: `ORD2026GB${pad(seq)}${100 + i}`,
      ord_ymd: day,
      m_id: `genbauser${pad(seq)}@example.com`,
      product_code: `GOPT${7000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      sku: `GENBA-SKU-${pad(seq)}`,
      name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]} (Genba)`,
      platform: GENBA_PLATFORMS[i % GENBA_PLATFORMS.length],
      publisher: GENBA_PUBLISHERS[i % GENBA_PUBLISHERS.length],
      genba_order_id: `GENBA-ORD-${1000 + seq}`,
      reservation_id: `GENBA-RSV-${2000 + seq}`,
      shipped_at: `${day} 23:${pad((i * 7) % 60)}:02`, // Created +9h(백엔드 포맷) 재현
      state: GENBA_STATES[i % GENBA_STATES.length],
    });
  }
  // legacy idx desc = seq 내림차순(이미 그렇게 생성)
  return list;
};

const orderGenbaSuccessRows = buildOrderGenbaSuccessRows();

// legacy order_genba_success.php 검색 규칙: search_key 등호(ordno/m_id/product_code), ord_ymd 범위.
const applyOrderGenbaSuccessFilters = (
  list: OrderGenbaSuccessItem[],
  url: URL,
): OrderGenbaSuccessItem[] => {
  const key = url.searchParams.get("search_key") || "";
  const value = url.searchParams.get("search_value") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (value) {
      if (key === "search_ordno" && row.ordno !== value) return false;
      if (key === "search_m_id" && row.m_id !== value) return false;
      if (key === "search_product_code" && row.product_code !== value) return false;
    }
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy genba_order_view.php: search_type별 Genba Order 조회(ordno→ID 역인덱스/item_order_id 직접/ctid).
// mock은 Genba 주문완료 행에서 파생(외부 GetOrder API 대체).
const findGenbaViewRow = (searchType: string, searchValue: string) => {
  if (searchType === "client_transaction_id") {
    return orderGenbaSuccessRows.find((r) => `CTID-${r.genba_order_id}` === searchValue) ?? null;
  }
  if (searchType === "item_order_id") {
    return orderGenbaSuccessRows.find((r) => r.genba_order_id === searchValue) ?? null;
  }
  // ordno(주문번호): tbl_order_item_genba.ordno → ID 역인덱스
  return orderGenbaSuccessRows.find((r) => r.ordno === searchValue) ?? null;
};

const buildGenbaViewInfo = (row: OrderGenbaSuccessItem | null): OrderGenbaViewInfo | null => {
  if (!row) return null;
  const gross = 55000 + (Number(row.genba_order_id.replace(/\D/g, "")) % 5) * 1000;
  return {
    client_transaction_id: `CTID-${row.genba_order_id}`,
    order_id: row.genba_order_id,
    reservation_id: row.reservation_id,
    sku: row.sku,
    created: row.shipped_at,
    state: row.state,
    communicated_buying_price_amount: 40000,
    communicated_buying_price_currency: "KRW",
    actual_buying_price_amount: 39000,
    actual_buying_price_currency: "KRW",
    selling_price_gross_amount: gross,
    selling_price_net_amount: Math.round(gross * 0.9),
    selling_price_currency: "KRW",
    keys: [
      { code: `${row.sku}-KEY1`, key_type: row.platform, sku: row.sku, product_name: row.name },
      { code: `${row.sku}-KEY2`, key_type: row.platform, sku: row.sku, product_name: row.name },
    ],
  };
};

// legacy tbl_order_item_vaultn(product_code>0) Vaultn 주문완료 재현. 정렬 reg_date desc.
const VAULTN_PROVIDERS = ["Steam", "Origin", "Uplay", "Epic"];
const VAULTN_PUBLISHERS = ["CD PROJEKT", "Rockstar", "EA", "Ubisoft"];
const VAULTN_STATUSES = ["Completed", "Pending", "Completed", "Shipped"];

const buildOrderVaultnSuccessRows = (): OrderVaultnSuccessItem[] => {
  const today = new Date();
  const list: OrderVaultnSuccessItem[] = [];
  for (let i = 0; i < 22; i += 1) {
    // 앞 6건 오늘(기본 이번달 필터에 포함), 이후 과거로.
    const d = new Date(today);
    d.setDate(d.getDate() - Math.max(0, i - 5));
    const day = ymd(d);
    const seq = 22 - i;
    list.push({
      client_order_reference: `ORD2026VN${pad(seq)}${100 + i}`,
      ord_ymd: day,
      m_id: `vaultnuser${pad(seq)}@example.com`,
      product_code: `GOPT${7000 + i}`,
      product_name: PRODUCT_NAMES[i % PRODUCT_NAMES.length],
      sku: `VAULTN-SKU-${pad(seq)}`,
      name: `${PRODUCT_NAMES[i % PRODUCT_NAMES.length]} (Vaultn)`,
      provider: VAULTN_PROVIDERS[i % VAULTN_PROVIDERS.length],
      publisher_name: VAULTN_PUBLISHERS[i % VAULTN_PUBLISHERS.length],
      order_id: `VAULTN-ORD-${1000 + seq}`,
      reg_date: `${day} 23:${pad((i * 7) % 60)}:02`,
      status: VAULTN_STATUSES[i % VAULTN_STATUSES.length],
    });
  }
  // legacy reg_date desc = seq 내림차순(이미 그렇게 생성)
  return list;
};

const orderVaultnSuccessRows = buildOrderVaultnSuccessRows();

// legacy order_vaultn_success.php 검색 규칙: search_ordno(clientOrderReference)/search_m_id 등호, ord_ymd 범위.
const applyOrderVaultnSuccessFilters = (
  list: OrderVaultnSuccessItem[],
  url: URL,
): OrderVaultnSuccessItem[] => {
  const ordno = url.searchParams.get("search_ordno") || "";
  const mId = url.searchParams.get("search_m_id") || "";
  const start = url.searchParams.get("search_start_date") || "";
  const end = url.searchParams.get("search_end_date") || "";

  return list.filter((row) => {
    if (ordno && row.client_order_reference !== ordno) return false;
    if (mId && row.m_id !== mId) return false;
    if (start && row.ord_ymd < start) return false;
    if (end && row.ord_ymd > end) return false;
    return true;
  });
};

// legacy vaultn_order_view.php: ordno면 clientOrderReference→orderId 역인덱스, item_order_id면 orderId 직접.
// 그 orderId로 Vaultn RetrieveOrder(외부 API). mock은 Vaultn 주문완료 행에서 파생.
const findVaultnViewRow = (searchType: string, searchValue: string) => {
  if (searchType === "item_order_id") {
    return orderVaultnSuccessRows.find((r) => r.order_id === searchValue) ?? null;
  }
  // ordno(주문번호): tbl_order_item_vaultn.clientOrderReference → orderId 역인덱스
  return orderVaultnSuccessRows.find((r) => r.client_order_reference === searchValue) ?? null;
};

const buildVaultnViewInfo = (row: OrderVaultnSuccessItem | null): OrderVaultnViewInfo | null => {
  if (!row) return null;
  return {
    order_id: row.order_id,
    client_order_reference: row.client_order_reference,
    client_customer_reference: row.m_id,
    created: row.reg_date,
    status: row.status,
    order_details: {
      sales_currency: "KRW",
      sales_country: "South Korea",
      sales_country_code: "KR",
      sales_price_gross: 55000,
      sales_price_net: 50000,
      applied_discount_percentage: "10",
      applied_discount_amount: 5000,
      price_list_details: {
        publisher_name: row.publisher_name,
        publisher_guid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        price_model: "Fixed",
        price_list_guid: "c3d4e5f6-7890-abcd-ef12-34567890abcd",
        country_code: "KR",
        srp_currency: "EUR",
        purchase_price_currency: "EUR",
        base_srp: 60,
        discounted_srp: 54,
        net_discounted_srp: 49.09,
        price_list_vat: "10",
        base_purchase_price: 40.0,
        promo_percentage: "5",
        net_purchase_price: 38.5,
        estimated_margin: 10.59,
      },
    },
  };
};

// legacy order_view.php — 주문 상세 집계(주문/항목/발송·배송/배송지/로그) 재현. settle_no로 조회.
const buildOrderDetail = (settleNo: string): OrderDetailResponse => {
  const today = ymd(new Date());
  return {
    order: {
      settle_no: settleNo,
      m_no: "200123",
      m_id: "orderuser@example.com",
      is_mobile: "N",
      ip: "203.0.113.10",
      country: "대한민국",
      reg_date: `${today} 10:03:11`,
      pg_provider: "kcp",
      payment_method: "SC0010",
      use_emoney: 0,
      use_cash: 0,
      member_dc: 0,
      total_price: 45000,
      step: "2",
      payment_date: `${today} 10:04:22`,
      version: "3",
    },
    items: [
      {
        // 디지털(Asset) 항목
        ordno: `${settleNo}-01`,
        product_code: "GOPT7001",
        product_name: PRODUCT_NAMES[0],
        repay: 450,
        goods_price: 50000,
        price: 45000,
        status: "2",
        is_actv: "1",
        completion_date: `${today} 10:05:00`,
        delivery_type: "1",
        order_system: "Asset",
        send_status: "",
        order_date: `${today} 10:03:11`,
        asset: [
          {
            asset_id: "5001",
            asset_name: `${PRODUCT_NAMES[0]} Steam Key`,
            asset_platform: "Steam",
            asset_publisher: "CD PROJEKT",
            reserve_id: "RSV-2026-0001",
          },
        ],
        ztorm: [],
        genba: [],
        vaultn: [],
        pointnexus: [],
        delivery: [],
      },
      {
        // 실물 항목
        ordno: `${settleNo}-02`,
        product_code: "GOPT8002",
        product_name: PRODUCT_NAMES[1],
        repay: 0,
        goods_price: 30000,
        price: 28000,
        status: "8",
        is_actv: "0",
        completion_date: "",
        delivery_type: "2",
        order_system: "",
        send_status: "",
        order_date: `${today} 10:03:11`,
        asset: [],
        ztorm: [],
        genba: [],
        vaultn: [],
        pointnexus: [],
        delivery: [
          {
            model_code: "MDL-1001",
            model_name: `${PRODUCT_NAMES[1]} 패키지`,
            shipment_status: "5",
            tracking_number: "123456789012",
            shipment_company_name: "CJ",
            shipped_date: `${today} 12:00:00`,
            estimated_delivery_date: `${today} 18:00:00`,
            actual_delivery_date: "",
            delivery_code: "001",
          },
        ],
      },
    ],
    address: {
      zipcode: "06134",
      address: "서울특별시 강남구 테헤란로 1",
      address_detail: "10층",
      name: "홍길동",
      tel: "010-1234-5678",
      msg: "부재 시 경비실에 맡겨주세요",
    },
    logs: [
      {
        ordno: `${settleNo}-01`,
        admin_id: "admin",
        reg_date: `${today} 10:06:00`,
        memo: "키 발급 완료",
      },
      {
        ordno: `${settleNo}-02`,
        admin_id: "admin",
        reg_date: `${today} 11:00:00`,
        memo: "취소요청 접수",
      },
    ],
    // pg_provider=kcp → kcp_log(SC0010 신용카드 예시). 217c-1.
    settle_log: {
      settle_no: settleNo,
      tno: "KCP20260729000001",
      tx_cd: "0000",
      pay_method: "카드",
      escw_yn: "N",
      amount: 45000,
      partcanc_yn: "N",
      isp_issuer_nm: "",
      card_name: "삼성카드",
      card_bin_type_01: "0",
      card_bin_type_02: "0",
      card_no: "1234-****-****-5678",
      card_mny: 45000,
      coupon_mny: 0,
      payco_point_mny: 0,
      app_no: "30001234",
      app_time: `${today} 10:04:22`,
      bank_name: "",
      bank_code: "",
      bk_mny: "",
      cash_authno: "",
      cash_no: "",
      ipgm_name: "",
      account: "",
      depositor: "",
      va_date: "",
      ipgm_mnyx: "",
      totl_mnyx: "",
      ipgm_time: "",
      noti_id: "",
      op_cd: "",
      remitter: "",
      cash_a_no: "",
      commid: "",
      mobile_no: "",
      van_id: "",
      // Toss(217c-2) — mock pg=kcp라 미사용(빈값).
      method: "",
      total_amount: 0,
      ba: 0,
      balance_amount: 0,
      requested_at: "",
      approved_at: "",
      payment_key: "",
      // Tosspay(217c-3) — mock pg=kcp라 미사용(빈값).
      discounted_amount: 0,
      paid_amount: 0,
      paid_ts: "",
      pay_token: "",
      // NaverPay(217c-5) — mock pg=kcp라 미사용(빈값).
      payment_id: "",
      admission_type_code: "",
      admission_ymdt: "",
      trade_confirm_ymdt: "",
      total_pay_amount: "",
      apply_pay_amount: "",
      primary_pay_amount: "",
      npoint_pay_amount: "",
      discount_pay_amount: "",
      primary_pay_means: "",
      card_corp_code: "",
      card_auth_no: "",
      bank_corp_code: "",
      bank_account_no: "",
      imp_uid: "imp_20260731000001", // 217g 아임포트 주문번호
    },
    payco: null, // pg=kcp mock이라 미사용(217c-4).
  };
};

export const orderHandlers = [
  http.get(api("/admin/order/payment-ready"), ({ request }) =>
    HttpResponse.json(paginate(rows, new URL(request.url))),
  ),
  http.get(api("/admin/order/ready"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const totalResults = orderReadyRows.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: orderReadyRows.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/all"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderAllFilters(orderAllRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/success"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderSuccessFilters(orderSuccessRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/cancel-request"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderCancelRequestFilters(orderCancelRequestRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/cancel-complete"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderCancelCompleteFilters(orderCancelCompleteRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/old"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const year = url.searchParams.get("search_year") || "2020";
    const filtered = applyOrderOldListFilters(buildOrderOldListRows(year), url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/shipment-all"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderShipmentAllFilters(orderShipmentRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/shipment-pending"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // legacy: shipment_status='2' 고정 → 배송대기 행만.
    const fixed = orderShipmentRows.filter((row) => row.shipment_status === "2");
    const filtered = applyOrderShipmentAllFilters(fixed, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/shipment-ready"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // legacy: shipment_status='3' 고정 → 배송준비 행만. settle_no 검색은 case 오타로 무효.
    const fixed = orderShipmentRows.filter((row) => row.shipment_status === "3");
    const filtered = applyOrderShipmentReadyFilters(fixed, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.post(api("/admin/order/shipment/shipping"), () =>
    // legacy shipment_shipping: shipment_status 3→4 + 에스크로 PG 배송등록(백엔드). mock은 성공만 응답.
    HttpResponse.json({ success: true }),
  ),
  http.get(api("/admin/order/shipment-shipping"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // legacy: shipment_status='4' 고정 → 배송중 행만. settle_no 검색 정상 동작.
    const fixed = orderShipmentRows.filter((row) => row.shipment_status === "4");
    const filtered = applyOrderShipmentAllFilters(fixed, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.post(api("/admin/order/shipment/shipped"), () =>
    // legacy shipment_shipped: shipment_status 4→5(백엔드). mock은 성공만 응답.
    HttpResponse.json({ success: true }),
  ),
  http.get(api("/admin/order/shipment-delivered"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // legacy: shipment_status='5' 고정 → 배송완료 행만.
    const fixed = orderShipmentRows.filter((row) => row.shipment_status === "5");
    const filtered = applyOrderShipmentAllFilters(fixed, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.post(api("/admin/order/shipment/actual-delivery"), () =>
    // legacy actual_delivery: shipment_status 5→6 구매확정(백엔드). mock은 성공만 응답.
    HttpResponse.json({ success: true }),
  ),
  http.get(api("/admin/order/shipment-confirm"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    // legacy: shipment_status='6' 고정 → 구매확정 행만(읽기전용).
    const fixed = orderShipmentRows.filter((row) => row.shipment_status === "6");
    const filtered = applyOrderShipmentAllFilters(fixed, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/asset-success"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderAssetSuccessFilters(orderAssetSuccessRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/ztorm-success"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderZtormSuccessFilters(orderZtormSuccessRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/ztorm-order-view"), ({ request }) => {
    const url = new URL(request.url);
    const searchType = url.searchParams.get("search_type") || "";
    const searchValue = url.searchParams.get("search_value") || "";
    const ordno = resolveZtormViewOrdno(searchType, searchValue);
    const order = buildZtormViewInfo(ordno);
    if (!order) {
      // legacy: ErrorCode != 0 → order_info=null, ErrorMsg 노출.
      return HttpResponse.json({ found: false, order: null, error: "Order not found" });
    }
    return HttpResponse.json({ found: true, order, error: "" });
  }),
  http.get(api("/admin/order/genba-success"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderGenbaSuccessFilters(orderGenbaSuccessRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/genba-order-view"), ({ request }) => {
    const url = new URL(request.url);
    const searchType = url.searchParams.get("search_type") || "";
    const searchValue = url.searchParams.get("search_value") || "";
    const order = buildGenbaViewInfo(findGenbaViewRow(searchType, searchValue));
    if (!order) {
      // legacy: rst.ID=="" → order_info=null, API 메시지 노출.
      return HttpResponse.json({ found: false, order: null, error: "Order not found" });
    }
    return HttpResponse.json({ found: true, order, error: "" });
  }),
  http.get(api("/admin/order/vaultn-success"), ({ request }) => {
    const url = new URL(request.url);
    const page = Math.max(1, Number.parseInt(url.searchParams.get("page") || "1", 10) || 1);
    const filtered = applyOrderVaultnSuccessFilters(orderVaultnSuccessRows, url);
    const totalResults = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalResults / PER_PAGE));
    const startIdx = (page - 1) * PER_PAGE;
    return HttpResponse.json({
      items: filtered.slice(startIdx, startIdx + PER_PAGE),
      pagination: { current_page: page, total_results: totalResults, total_pages: totalPages },
    });
  }),
  http.get(api("/admin/order/vaultn-order-view"), ({ request }) => {
    const url = new URL(request.url);
    const searchType = url.searchParams.get("search_type") || "";
    const searchValue = url.searchParams.get("search_value") || "";
    const order = buildVaultnViewInfo(findVaultnViewRow(searchType, searchValue));
    if (!order) {
      // legacy: rst.orderId=="" → order_info=null.
      return HttpResponse.json({ found: false, order: null, error: "Order not found" });
    }
    return HttpResponse.json({ found: true, order, error: "" });
  }),
  http.get(api("/admin/order/detail"), ({ request }) => {
    const url = new URL(request.url);
    const settleNo = url.searchParams.get("settle_no") || "";
    // "NONE" 포함 시 미존재(order=null) 재현.
    if (settleNo.includes("NONE")) {
      return HttpResponse.json({
        order: null,
        items: [],
        address: null,
        logs: [],
        settle_log: null,
        payco: null,
      });
    }
    return HttpResponse.json(buildOrderDetail(settleNo));
  }),
  http.post(api("/admin/order/kcp-refund"), () => {
    // legacy order_ps.php mode=kcp_refund: Kcp::cancelPayment → step=9 등. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/toss-adapter-refund"), () => {
    // legacy order_ps.php mode=toss_adapter_refund. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/toss-refund"), () => {
    // legacy order_ps.php mode=toss_refund(부분취소). mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/tosspay-refund"), () => {
    // legacy order_ps.php mode=tosspay_refund(부분취소). mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/payco-refund"), () => {
    // legacy order_ps.php mode=payco_refund. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/payco-cancel"), () => {
    // legacy order_ps.php mode=payco_cancel(계좌반납). mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/naverpay-refund"), () => {
    // legacy order_ps.php mode=naverpay_refund. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/item-cancel"), () => {
    // legacy order_ps.php mode=order_item_cancel. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/reject"), () => {
    // legacy order_ps.php mode=order_reject. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/resend"), () => {
    // legacy order_ps.php mode=resend. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/tracking-register"), () => {
    // legacy order_ps.php mode=register_tracking_no_item. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/memo-add"), () => {
    // legacy order_ps.php mode=memo_add. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/point-refund"), () => {
    // legacy order_ps.php mode=point_refund. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/order-refund"), () => {
    // legacy order_ps.php mode=order_refund. mock은 성공만.
    return HttpResponse.json({ success: true });
  }),
  http.post(api("/admin/order/payco-detail"), async ({ request }) => {
    // legacy order_detail.php: paycoGetDetailForVerify 응답 덤프. mock은 샘플 객체.
    const body = (await request.json()) as {
      reserve_order_no: string;
      seller_order_reference_key: string;
    };
    return HttpResponse.json({
      detail: {
        reserveOrderNo: body.reserve_order_no,
        sellerOrderReferenceKey: body.seller_order_reference_key,
        orderStatus: "COMPLETE",
        totalPaymentAmt: 45000,
        paymentDetails: [{ paymentMethodName: "카드", paymentAmt: 45000 }],
      },
    });
  }),
  http.post(api("/admin/order/licence"), async ({ request }) => {
    // legacy order_licence.php: getAssetLicence(Asset.runReserveAdmin) / getPointNexusLicence(라이브+DB 폴백).
    const body = (await request.json()) as { mode: string; item_order_id: string };
    const mode = body.mode || "";
    const itemOrderId = body.item_order_id || "";
    const res: OrderLicenceResponse = { mode, asset: null, pointnexus: null };
    if (mode === "getAssetLicence") {
      res.asset = {
        title: "Cyberpunk 2077 Steam Key",
        key: `CP77-${itemOrderId}-XXXX`,
        activated_dt: `${ymd(new Date())} 10:05:00`,
      };
    } else if (mode === "getPointNexusLicence") {
      // "NONE" → 미발급(row 없음)
      res.pointnexus = itemOrderId.includes("NONE")
        ? {
            found: false,
            name: "",
            source: "",
            error: "",
            status: "",
            license_key: "",
            license_platform: "",
          }
        : {
            found: true,
            name: "사이버펑크 2077",
            source: "live",
            error: "",
            status: "sold",
            license_key: `PN-${itemOrderId}-AAAA-BBBB`,
            license_platform: "Steam",
          };
    }
    return HttpResponse.json(res);
  }),
  http.post(api("/admin/order/asset-key-bulk"), async ({ request }) => {
    // legacy: 각 ordno → tbl_order_item_asset + runReserveAdmin. "NONE" 포함 ordno는 키 없음(found=false).
    const body = (await request.json()) as { ordnos: string[] };
    const ordnos = Array.isArray(body.ordnos) ? body.ordnos : [];
    const resultRows: { ordno: string; found: boolean; key: string | null }[] = [];
    let matched = 0;
    let keyCount = 0;
    ordnos.forEach((ordno, i) => {
      if (ordno.includes("NONE")) {
        resultRows.push({ ordno, found: false, key: null });
        return;
      }
      matched += 1;
      // 키 2건(하나는 조회 실패 null) 생성.
      resultRows.push({ ordno, found: true, key: `KEY-${pad(i)}-AAAAA` });
      resultRows.push({ ordno, found: true, key: i % 3 === 0 ? null : `KEY-${pad(i)}-BBBBB` });
      keyCount += 2;
    });
    return HttpResponse.json({
      result_rows: resultRows,
      matched_ordno_count: matched,
      key_count: keyCount,
    });
  }),
  http.get(api("/admin/order/asset-key"), ({ request }) => {
    // legacy: ordno 단건 조회. "NONE"이면 주문 항목 없음(경고) 케이스 재현.
    const ordno = new URL(request.url).searchParams.get("ordno") || "";
    if (ordno === "NONE") {
      return HttpResponse.json({ order_info: null, key_rows: [] });
    }
    return HttpResponse.json({
      order_info: {
        ordno,
        settle_no: "20260729SC0001",
        product_code: "GOPT7001",
        product_name: "사이버펑크 2077",
        status: "2",
        is_actv: "0",
        order_system: "Asset",
        m_id: "assetuser01@example.com",
      },
      key_rows: [
        {
          product: "사이버펑크 2077",
          asset_id: "5001",
          publisher: "CD PROJEKT",
          reserve_id: "RSV-2026-0001",
          key: "AAAAA-BBBBB-CCCCC",
          activated: false,
          activatedDt: "",
          po: "PO-2026-01",
        },
        {
          product: "사이버펑크 2077 DLC",
          asset_id: "5002",
          publisher: "CD PROJEKT",
          reserve_id: "RSV-2026-0002",
          key: null, // 조회 실패
          activated: true,
          activatedDt: "2026-07-28 14:00:00",
          po: "PO-2026-02",
        },
      ],
    });
  }),
  http.get(api("/admin/order/payment-approved"), ({ request }) =>
    HttpResponse.json(paginate(approvedRows, new URL(request.url))),
  ),
  http.get(api("/admin/order/vbank"), ({ request }) =>
    HttpResponse.json(paginate(vbankRows, new URL(request.url))),
  ),
];
