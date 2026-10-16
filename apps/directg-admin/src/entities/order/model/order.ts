import type {
  OrderPaymentReadySearch,
  OrderVbankSearch,
  OrderAllSearch,
  OrderSuccessSearch,
  OrderCancelRequestSearch,
  OrderCancelCompleteSearch,
  OrderOldListSearch,
  OrderShipmentAllSearch,
  OrderShipmentFixedSearch,
  OrderAssetSuccessSearch,
  OrderZtormSuccessSearch,
  OrderGenbaSuccessSearch,
  OrderVaultnSuccessSearch,
} from "./types";

// legacy AdminOrder::getSettlekindLabel — 결제수단 코드→라벨. 미매칭(switch default 없음)은 빈 문자열.
export const SETTLE_KIND_LABEL: Record<string, string> = {
  SC0010: "신용카드",
  SC0030: "계좌이체",
  SC0040: "가상계좌",
  SC0060: "휴대폰",
  POINT: "포인트",
  PAYCO: "페이코",
  DG0000: "전액할인",
  samsung: "삼성페이",
  toss_bank: "퀵계좌이체",
  toss_pay: "토스머니",
};

export const getSettleKindLabel = (code: string): string => SETTLE_KIND_LABEL[code] ?? "";

// legacy order_step1.php 결제 PG radio (값 uplus=라벨 DGKR quirk 유지)
export const PG_PROVIDER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "kcp", label: "KCP" },
  { value: "naverpay", label: "네이버페이" },
  { value: "payco", label: "페이코" },
  { value: "toss", label: "토스" },
  { value: "uplus", label: "DGKR" },
] as const;

// legacy order_step1.php 결제수단 radio (10종)
export const PAYMENT_METHOD_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "SC0010", label: "신용카드" },
  { value: "SC0030", label: "계좌이체" },
  { value: "SC0040", label: "가상계좌" },
  { value: "SC0060", label: "휴대폰" },
  { value: "POINT", label: "포인트" },
  { value: "PAYCO", label: "페이코" },
  { value: "toss_bank", label: "퀵계좌이체" },
  { value: "samsung", label: "삼성페이" },
  { value: "DG0000", label: "전액할인" },
] as const;

// legacy order_step2.php 결제수단 radio (11종 — step1 + toss_pay 토스페이)
export const PAYMENT_METHOD_STEP2_OPTIONS = [
  ...PAYMENT_METHOD_OPTIONS,
  { value: "toss_pay", label: "토스페이" },
] as const;

// legacy AdminOrder::getPGProvider — 결제 PG 라벨. 미매칭(default 없음)은 빈 문자열.
// uplus는 payment_method=="DG0000"일 때만 "DGKR"(아니면 빈 문자열) quirk.
export const getPGProviderLabel = (pgProvider: string, paymentMethod: string): string => {
  switch (pgProvider) {
    case "kcp":
      return "KCP";
    case "naverpay":
      return "네이버페이";
    case "payco":
      return "페이코";
    case "uplus":
      return paymentMethod === "DG0000" ? "DGKR" : "";
    case "DGKR":
      return "전액할인";
    case "toss":
      return "토스";
    case "toss_pay":
      return "토스페이";
    default:
      return "";
  }
};

// legacy AdminOrder::getCheckoutStatus — 결제상태 라벨. 미매칭(default 없음)은 빈 문자열.
export const CHECKOUT_STATUS_LABEL: Record<string, string> = {
  "1": "입금대기",
  "2": "결제완료",
  "8": "환불요청",
  "9": "환불완료",
  "99": "취소완료",
};

export const getCheckoutStatusLabel = (step: string): string => CHECKOUT_STATUS_LABEL[step] ?? "";

// legacy AdminOrder::getOrderStatus — 주문상태 라벨. 미매칭(default 없음)은 빈 문자열.
export const ORDER_STATUS_LABEL: Record<string, string> = {
  "1": "주문대기",
  "2": "주문완료",
  "3": "배송준비",
  "4": "배송중",
  "5": "배송완료",
  "6": "구매확정",
  "8": "취소요청",
  "9": "취소완료",
};

export const getOrderStatusLabel = (status: string): string => ORDER_STATUS_LABEL[status] ?? "";

// legacy AdminOrder::getDeliveryType — 배송유형 라벨. 미매칭(default 없음)은 빈 문자열.
export const DELIVERY_TYPE_LABEL: Record<string, string> = {
  "1": "코드발송",
  "2": "택배발송",
  "3": "코드 + 택배발송",
};

export const getDeliveryTypeLabel = (type: string): string => DELIVERY_TYPE_LABEL[type] ?? "";

// legacy order_all.php search_key select (순서 유지)
export const ORDER_ALL_SEARCH_KEY_OPTIONS = [
  { value: "search_ordno", label: "주문번호" },
  { value: "search_settle_no", label: "결제번호" },
  { value: "search_m_id", label: "회원아이디" },
  { value: "search_product_code", label: "옵션상품코드" },
] as const;

// legacy order_all.php 연동시스템 radio
export const ORDER_SYSTEM_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "Asset", label: "Asset" },
  { value: "Ztorm", label: "Ztorm" },
  { value: "Genba", label: "Genba" },
  { value: "Vaultn", label: "Vaultn" },
] as const;

// legacy order_success.php 연동시스템 radio (order_all + PointNexus). 값 none은 radio 미노출(GET 전용).
export const ORDER_SUCCESS_SYSTEM_OPTIONS = [
  ...ORDER_SYSTEM_OPTIONS,
  { value: "PointNexus", label: "PointNexus" },
] as const;

// legacy order_success.php 수령여부 radio
export const IS_ACTV_OPTIONS = [
  { value: "", label: "전체" },
  { value: "0", label: "수령대기" },
  { value: "1", label: "수령완료" },
] as const;

// legacy order_cancel_request.php / order_cancel_complete.php search_key select (결제번호 first)
export const ORDER_CANCEL_SEARCH_KEY_OPTIONS = [
  { value: "search_settle_no", label: "결제번호" },
  { value: "search_ordno", label: "주문번호" },
  { value: "search_m_id", label: "회원아이디" },
  { value: "search_product_code", label: "옵션상품코드" },
] as const;

// legacy order_cancel_complete.php 정렬순서 radio
export const ORDER_ORDERBY_OPTIONS = [
  { value: "cancel_date", label: "취소완료일(내림차순)" },
  { value: "order_date", label: "구매일(내림차순)" },
] as const;

// legacy order_cancel_complete.php 기간유형 radio
export const ORDER_DATE_TYPE_OPTIONS = [
  { value: "cancel_date", label: "취소완료일" },
  { value: "order_date", label: "구매일" },
] as const;

// legacy order_asset_key_bulk.php MAX_ORDNO — 일괄 조회 최대 건수(초과 시 앞 20건만, capped).
export const ORDER_ASSET_KEY_BULK_MAX = 20;

// legacy order_asset_success.php search_key select (Asset ID 포함, 결제번호 없음)
export const ORDER_ASSET_SEARCH_KEY_OPTIONS = [
  { value: "search_ordno", label: "주문번호" },
  { value: "search_m_id", label: "회원아이디" },
  { value: "search_asset_id", label: "Asset ID" },
  { value: "search_product_code", label: "옵션상품코드" },
] as const;

// order_asset_success.php 이식. 기본 기간 오늘~오늘(order_all과 동일), search_value 우선 기간무시.
export const resolveOrderAssetSuccessSearch = (
  raw: OrderAssetSuccessSearch,
): OrderAssetSuccessSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    start = toYmd(new Date());
  }
  if (end === "") {
    end = toYmd(new Date());
  }

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// legacy order_genba_success.php search_key select (주문번호/회원아이디/옵션상품코드, Asset ID 없음)
export const ORDER_GENBA_SEARCH_KEY_OPTIONS = [
  { value: "search_ordno", label: "주문번호" },
  { value: "search_m_id", label: "회원아이디" },
  { value: "search_product_code", label: "옵션상품코드" },
] as const;

// legacy order_genba_success.php State switch — 0 품절/1 예약구매/2 완료. 미매칭 빈셀.
export const GENBA_STATE_LABEL: Record<string, string> = {
  "0": "품절",
  "1": "예약구매",
  "2": "완료",
};

// order_genba_success.php 24~70 이식. 기본 기간 이번달 1일~말일, search_value 우선 기간무시.
export const resolveOrderGenbaSuccessSearch = (
  raw: OrderGenbaSuccessSearch,
): OrderGenbaSuccessSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const t = new Date();
    start = toYmd(new Date(t.getFullYear(), t.getMonth(), 1)); // 이번달 1일
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_vaultn_success.php 24~67 이식. 기본 기간 이번달 1일~말일.
// 키워드 2종(ordno=clientOrderReference/m_id) 중 하나라도 있으면 기간무시. 정렬은 reg_date desc(백엔드).
export const resolveOrderVaultnSuccessSearch = (
  raw: OrderVaultnSuccessSearch,
): OrderVaultnSuccessSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const t = new Date();
    start = toYmd(new Date(t.getFullYear(), t.getMonth(), 1)); // 이번달 1일
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  const hasKeyword = raw.search_ordno !== "" || raw.search_m_id !== "";
  if (hasKeyword) {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_ztorm_success.php 27~72 이식. 기본 기간 이번달 1일~말일.
// 키워드 3종(ordno/ztorm_id/m_id) 중 하나라도 있으면 기간무시(전체기간).
export const resolveOrderZtormSuccessSearch = (
  raw: OrderZtormSuccessSearch,
): OrderZtormSuccessSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const t = new Date();
    start = toYmd(new Date(t.getFullYear(), t.getMonth(), 1)); // 이번달 1일
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  const hasKeyword =
    raw.search_ztorm_id !== "" || raw.search_ordno !== "" || raw.search_m_id !== "";
  if (hasKeyword) {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// legacy order_shipment_all.php shipment_status_text — 배송상태. 미매칭 빈셀.
export const SHIPMENT_STATUS_LABEL: Record<string, string> = {
  "2": "배송대기",
  "3": "배송준비",
  "4": "배송중",
  "5": "배송완료",
  "6": "구매확정",
};

// legacy order_shipment_all.php 배송상태 radio (전체 주석처리 → 미포함)
export const SHIPMENT_STATUS_OPTIONS = [
  { value: "2", label: "배송대기" },
  { value: "3", label: "배송준비" },
  { value: "4", label: "배송중" },
  { value: "5", label: "배송완료" },
  { value: "6", label: "구매확정" },
] as const;

// legacy AdminOrder::getShipmentStatus — 배송상태 라벨(2~9, shipping 화면). 미매칭 빈셀.
// (all의 shipment_status_text 배열은 2~6만 → SHIPMENT_STATUS_LABEL과 별개)
export const SHIPMENT_STATUS_FULL_LABEL: Record<string, string> = {
  "2": "배송대기",
  "3": "배송준비",
  "4": "배송중",
  "5": "배송완료",
  "6": "구매확정",
  "8": "취소요청",
  "9": "취소완료",
};

export const getShipmentStatusFullLabel = (status: string): string =>
  SHIPMENT_STATUS_FULL_LABEL[status] ?? "";

// legacy 배송 주문 관리 daterangepicker 프리셋 세트(지난 30일·이번달 없음, 지난해 추가)
export const SHIPMENT_PRESET_KEYS = [
  "선택",
  "오늘",
  "어제",
  "지난 7일",
  "지난달",
  "지난해",
  "직접선택",
] as const;

// legacy order_old_list.php 연도선택 select (::연도선택:: + 2013~2020)
export const ORDER_OLD_YEAR_OPTIONS = [
  { value: "", label: "::연도선택::" },
  { value: "2013", label: "2013년" },
  { value: "2014", label: "2014년" },
  { value: "2015", label: "2015년" },
  { value: "2016", label: "2016년" },
  { value: "2017", label: "2017년" },
  { value: "2018", label: "2018년" },
  { value: "2019", label: "2019년" },
  { value: "2020", label: "2020년" },
] as const;

// legacy order_old_list.php 화면 로컬 배열 settlekind2 — 결제방법. 미매칭 빈셀.
export const OLD_SETTLEKIND_LABEL: Record<string, string> = {
  "000000": "현금",
  SC0000: "무통장입금",
  SC0010: "신용카드",
  SC0030: "실시간 계좌이체",
  SC0040: "가상계좌",
  SC0060: "휴대폰",
  DG0000: "전액할인",
  PAYCO: "PAYCO",
  samsung: "삼성페이",
  naverpay: "네이버페이",
  POINT: "네이버포인트",
};

// legacy order_old_list.php settleStatus2 — 결제상태. 미매칭 빈셀.
export const OLD_SETTLE_STATUS_LABEL: Record<string, string> = {
  "0": "결제완료",
  "1": "결제대기",
  "2": "결제완료",
  "3": "결제실패",
  "9": "결제취소",
  "99": "주문취소",
};

// legacy order_old_list.php orderStatus — 주문상태. 미매칭 빈셀.
export const OLD_ORDER_STATUS_LABEL: Record<string, string> = {
  "0": "주문완료",
  "1": "주문대기",
  "2": "주문완료",
  "8": "취소요청",
  "9": "취소완료",
};

const pad = (n: number) => String(n).padStart(2, "0");
const toYmd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// order_step1.php 22~65 이식: 날짜 기본값 + settle_no/m_id 우선 기간무시 정규화.
// 반환값은 화면 표시(DateRangePicker)와 fetch(useOrderPaymentReady) 양쪽에 쓰인다.
export type ResolvedOrderPaymentReadySearch = OrderPaymentReadySearch;

export const resolveOrderPaymentReadySearch = (
  raw: OrderPaymentReadySearch,
): ResolvedOrderPaymentReadySearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  // 날짜 기본값 quirk: 빈값이면 시작=오늘-2일(코드 우선, 주석 "이번달 1일"과 불일치), 종료=오늘.
  if (start === "") {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    start = toYmd(d);
  }
  if (end === "") {
    end = toYmd(new Date());
  }

  // 결제번호 or 회원아이디 조건이 있으면 기간검색 무시 + date_label 전체기간.
  if (raw.search_settle_no !== "" || raw.search_m_id !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    // 키워드 지우고 다시 검색할 때 라벨 기본값으로 초기화.
    label = "";
  }

  const pg = raw.search_pg_provider === "" ? "all" : raw.search_pg_provider;
  const method = raw.search_payment_method === "" ? "all" : raw.search_payment_method;

  return {
    ...raw,
    search_start_date: start,
    search_end_date: end,
    date_label: label,
    search_pg_provider: pg,
    search_payment_method: method,
  };
};

// order_vbank.php 20~63 이식. step1/2와 동일하나 **날짜 기본 시작=한 달 전(-1 MONTH)** quirk. PG/결제수단 없음.
export const resolveOrderVbankSearch = (raw: OrderVbankSearch): OrderVbankSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // strtotime('-1 MONTH') (주석 "이번달 1일"과 불일치)
    start = toYmd(d);
  }
  if (end === "") {
    end = toYmd(new Date());
  }

  if (raw.search_settle_no !== "" || raw.search_m_id !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_all.php 21~95 이식. 기본 기간 = 오늘~오늘. search_value 있으면 기간무시(search_key 무관).
export const resolveOrderAllSearch = (raw: OrderAllSearch): OrderAllSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    start = toYmd(new Date()); // 오늘 (step1은 -2day·vbank는 -1month)
  }
  if (end === "") {
    end = toYmd(new Date());
  }

  const orderSystem = raw.order_system === "" ? "all" : raw.order_system;

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return {
    ...raw,
    search_start_date: start,
    search_end_date: end,
    date_label: label,
    order_system: orderSystem,
  };
};

// order_cancel_request.php 20~87 이식. **기본 날짜 없음(전체기간)**. search_value 있으면 기간무시.
// 날짜 미지정이면 date_label="전체기간"으로 표기.
export const resolveOrderCancelRequestSearch = (
  raw: OrderCancelRequestSearch,
): OrderCancelRequestSearch => {
  const start = raw.search_start_date;
  const end = raw.search_end_date;
  let label = raw.date_label;

  if (raw.search_value !== "") {
    return { ...raw, search_start_date: "", search_end_date: "", date_label: "전체기간" };
  }
  if (label === "전체기간") {
    label = "";
  }
  // 날짜 미지정이면 전체기간 표기.
  if (start === "") {
    label = "전체기간";
  }
  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_old_list.php 24~94 이식. 연도 기본 2020, 날짜 무조건 전체기간(연도로만 조회).
export const resolveOrderOldListSearch = (raw: OrderOldListSearch): OrderOldListSearch => {
  const year = raw.search_year === "" ? "2020" : raw.search_year;
  return {
    ...raw,
    search_year: year,
    search_start_date: "",
    search_end_date: "",
    date_label: "전체기간",
  };
};

// order_shipment_all.php 21~92 이식. 기본 기간 지난달 1일~이번달 말일. search_value 우선 기간무시.
export const resolveOrderShipmentAllSearch = (
  raw: OrderShipmentAllSearch,
): OrderShipmentAllSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const t = new Date();
    start = toYmd(new Date(t.getFullYear(), t.getMonth() - 1, 1)); // 지난달 1일
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_shipment_{pending,ready,shipping,delivered,confirm}.php 이식. 배송상태 고정 화면 공용.
// #202(all)와 동일 날짜 로직(지난달 1일~이번달 말일, search_value 우선 기간무시). shipment_status radio 없음.
export const resolveOrderShipmentFixedSearch = (
  raw: OrderShipmentFixedSearch,
): OrderShipmentFixedSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const t = new Date();
    start = toYmd(new Date(t.getFullYear(), t.getMonth() - 1, 1)); // 지난달 1일
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_shipment_ready.php 이식. **기본 시작 "2025-01-01" 하드코딩(개발자 승인)**, end 이번달 말일.
// 의도 코드(date('Y-m-01')=이번달 1일)는 legacy 주석처리 → 하드코딩 그대로 이식(quirk).
export const resolveOrderShipmentReadySearch = (
  raw: OrderShipmentFixedSearch,
): OrderShipmentFixedSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    start = "2025-01-01"; // legacy 하드코딩 quirk
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return { ...raw, search_start_date: start, search_end_date: end, date_label: label };
};

// order_cancel_complete.php 24~112 이식. 기본 기간 이번달 1일~말일. 정렬순서/기간유형/PG/결제수단 정규화.
export const resolveOrderCancelCompleteSearch = (
  raw: OrderCancelCompleteSearch,
): OrderCancelCompleteSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    const t = new Date();
    start = toYmd(new Date(t.getFullYear(), t.getMonth(), 1)); // 이번달 1일
  }
  if (end === "") {
    const t = new Date();
    end = toYmd(new Date(t.getFullYear(), t.getMonth() + 1, 0)); // 이번달 말일
  }

  const pg = raw.search_pg_provider === "" ? "all" : raw.search_pg_provider;
  const method = raw.search_payment_method === "" ? "all" : raw.search_payment_method;
  // 정렬순서: cancel_date/order_date 아니면 cancel_date.
  const orderby =
    raw.search_orderby === "cancel_date" || raw.search_orderby === "order_date"
      ? raw.search_orderby
      : "cancel_date";
  let dateType = raw.search_date_type;

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else {
    if (label === "전체기간") {
      label = "";
    }
    // 기간유형: cancel_date 아니면 order_date(else 분기 재설정).
    if (dateType !== "cancel_date") {
      dateType = "order_date";
    }
  }

  return {
    ...raw,
    search_start_date: start,
    search_end_date: end,
    date_label: label,
    search_pg_provider: pg,
    search_payment_method: method,
    search_orderby: orderby,
    search_date_type: dateType,
  };
};

// order_success.php 31~126 이식. order_all과 동일(기본 오늘~오늘·search_value 기간무시·order_system 기본 all).
// 추가 필터(is_actv/delivery_type/price)는 정규화 없이 passthrough.
export const resolveOrderSuccessSearch = (raw: OrderSuccessSearch): OrderSuccessSearch => {
  let start = raw.search_start_date;
  let end = raw.search_end_date;
  let label = raw.date_label;

  if (start === "") {
    start = toYmd(new Date());
  }
  if (end === "") {
    end = toYmd(new Date());
  }

  const orderSystem = raw.order_system === "" ? "all" : raw.order_system;

  if (raw.search_value !== "") {
    start = "";
    end = "";
    label = "전체기간";
  } else if (label === "전체기간") {
    label = "";
  }

  return {
    ...raw,
    search_start_date: start,
    search_end_date: end,
    date_label: label,
    order_system: orderSystem,
  };
};
