// legacy pc/_Admin_/order/* + src/classes/AdminOrder.php
// order 영역 공통 타입. 첫 단위(order_step1 입금대기 리스트)부터 순차 확장.

// legacy getOrderPaymentReady SELECT 컬럼 중 화면 사용분(tbl_order)
export type OrderPaymentReadyItem = {
  reg_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  m_id: string; // 주문자
  ip: string; // 주문IP
  pg_provider: string; // PG (raw)
  payment_method: string; // 결제수단 코드 (라벨 변환은 SETTLE_KIND_LABEL)
  total_price: number; // 결제금액
  step: string; // 결제상태 (raw)
  version: string; // 결제버전
  is_mobile: string; // Y=모바일 / N=PC
};

// legacy Pagination.php current/total 재현
export type OrderPagination = {
  current_page: number;
  total_results: number;
  total_pages: number;
};

export type OrderPaymentReadyResponse = {
  items: OrderPaymentReadyItem[];
  pagination: OrderPagination;
};

// legacy getOrderPaymentApproved SELECT 컬럼(tbl_order step='2', 결제완료)
export type OrderPaymentApprovedItem = {
  reg_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  is_mobile: string; // Y=M 뱃지
  m_id: string; // 회원아이디
  ip: string; // 주문IP
  pg_provider: string; // getPGProvider(pg, method) 변환
  payment_method: string; // getSettlekindLabel 변환
  use_emoney: number; // 포인트할인(=use_emoney+use_cash)
  use_cash: number;
  total_price: number; // 결제금액
  step: string; // getCheckoutStatus 변환
  payment_date: string; // 결제완료일자
};

export type OrderPaymentApprovedResponse = {
  items: OrderPaymentApprovedItem[];
  pagination: OrderPagination;
};

// order_step1.php / order_step2.php GET 파라미터
export type OrderPaymentReadySearch = {
  page: number;
  search_settle_no: string;
  search_m_id: string;
  search_pg_provider: string;
  search_payment_method: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy getOrderVbankReady SELECT 컬럼 중 화면 사용분(tbl_order⋈kcp_log⋈payco_log, step='1' 가상계좌)
export type OrderVbankItem = {
  reg_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  m_id: string; // 주문자
  ip: string; // 주문IP
  total_price: number; // 결제금액
  step: string; // 결제상태 (step=8→취소요청 오버라이드, else getCheckoutStatus)
  is_mobile: string; // Y=모바일 / N=PC
  pg_provider: string; // 마감시각 만료 판정 분기(payco 여부)
  va_date: string; // 마감시각 (payco=Y-m-d / kcp=Y-m-d H:i:s, 백엔드 포맷)
};

export type OrderVbankResponse = {
  items: OrderVbankItem[];
  pagination: OrderPagination;
};

// order_vbank.php GET 파라미터 (PG/결제수단 없음)
export type OrderVbankSearch = {
  page: number;
  search_settle_no: string;
  search_m_id: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy getOrderAll SELECT(tbl_order a ⋈ tbl_order_item b, b.* + a.step)
export type OrderAllItem = {
  order_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  step: string; // 결제상태 (getCheckoutStatus)
  ordno: string; // 주문번호
  m_id: string; // 회원아이디
  ip: string; // 주문IP
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명
  is_mobile: string; // Y=M 뱃지
  price: number; // 주문금액
  status: string; // 주문상태 (getOrderStatus)
  is_actv: string; // 수령여부 (0=수령대기 / else 수령완료)
  delivery_type: string; // 배송유형 (getDeliveryType)
  order_system: string; // 연동시스템
};

export type OrderAllResponse = {
  items: OrderAllItem[];
  pagination: OrderPagination;
};

// order_all.php GET 파라미터 (search_key select + order_system radio)
export type OrderAllSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
  order_system: string;
};

// legacy getOrderReadyList SELECT(tbl_order⋈tbl_order_item, step=2·send_status=fail·status=1)
export type OrderReadyItem = {
  order_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  ordno: string; // 주문번호
  m_id: string; // 회원아이디 (IP 없음)
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명
  is_mobile: string; // Y=M 뱃지
  price: number; // 주문금액
  status: string; // 주문상태 (getOrderStatus)
  delivery_type: string; // 배송유형 (getDeliveryType)
};

export type OrderReadyResponse = {
  items: OrderReadyItem[];
  pagination: OrderPagination;
};

// order_ready.php GET 파라미터 (검색필터 없음, page만)
export type OrderReadySearch = {
  page: number;
};

// legacy getOrderShipmentAll SELECT(tbl_order⋈order_item⋈order_shipment, step=2·status=2·delivery_type≠1 택배)
export type OrderShipmentItem = {
  order_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  ordno: string; // 주문번호
  m_id: string; // 회원아이디 (IP 없음)
  product_code: string; // 상품코드 (별도 컬럼)
  product_name: string; // 상품명
  is_mobile: string; // Y=M 뱃지
  price: number; // 주문금액
  status: string; // 주문상태 (getOrderStatus)
  shipment_status: string; // 배송상태 (all: SHIPMENT_STATUS_LABEL 2~6)
  send_status: string; // 배송상태 raw (pending 등 고정상태 화면)
  is_actv: string; // 수령여부 (1=O/else X)
  // ready 배송중 전환 mutation 파라미터(백엔드 enrichment: kcp/toss escrow·배송정보). 화면 미표시.
  pg_provider?: string;
  escw_yn?: string;
  tno?: string;
  tracking_no?: string;
  delivery_code?: string;
  tracking_number?: string; // shipping 화면 운송장번호 표시 + 배송조회
  actual_delivery_date?: string; // confirm 화면 구매확정일자(주문일자 셀 2줄)
};

// order_ps.php mode=shipment_shipping — 선택 배송준비 주문 → 배송중 일괄 전환(배열 payload).
export type OrderShipmentShippingRequest = {
  step_arr: string[];
  settle_no_arr: string[];
  escw_arr: string[];
  tno_arr: string[];
  ordno_arr: string[];
  pg_arr: string[];
  tracking_no_arr: string[];
  delivery_code_arr: string[];
};

// order_ps.php mode=shipment_shipped — 선택 배송중 주문 → 배송완료 일괄 전환(배열 payload 5종).
export type OrderShipmentShippedRequest = {
  step_arr: string[];
  settle_no_arr: string[];
  escw_arr: string[];
  tno_arr: string[];
  ordno_arr: string[];
};

export type OrderShipmentAllResponse = {
  items: OrderShipmentItem[];
  pagination: OrderPagination;
};

// legacy getOrderAssetSuccess SELECT(tbl_order_item_asset, asset_id>'0')
export type OrderAssetSuccessItem = {
  order_date: string; // 주문일자
  ordno: string; // 주문번호
  m_id: string; // 회원아이디
  m_no: string; // 회원번호(m_id 셀 2줄)
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명
  asset_id: string; // Asset ID
  asset_name: string; // Asset명
  asset_type: string; // Asset 유형(임시코드면 bg-danger)
  asset_publisher: string; // Asset 공급처
  reserve_id: string; // Reseve ID(오타 유지)
};

export type OrderAssetSuccessResponse = {
  items: OrderAssetSuccessItem[];
  pagination: OrderPagination;
};

// order_asset_success.php GET 파라미터
export type OrderAssetSuccessSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy getOrderZtormSuccess SELECT(tbl_order_item_ztorm, ztorm_item_id>0)
export type OrderZtormSuccessItem = {
  order_date: string; // 주문일자
  ordno: string; // 주문번호
  m_id: string; // 회원아이디(m_no 없음)
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명
  ztorm_item_id: string; // Ztorm Product ID
  ztorm_item_name: string; // Ztorm 상품명
  ztorm_publisher: string; // Ztorm 공급처(뱃지)
  customer_product_id: string; // customer_product_id
};

export type OrderZtormSuccessResponse = {
  items: OrderZtormSuccessItem[];
  pagination: OrderPagination;
};

// order_ztorm_success.php GET 파라미터(개별 input 3종 + 기간)
export type OrderZtormSuccessSearch = {
  page: number;
  search_ordno: string;
  search_ztorm_id: string;
  search_m_id: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy ztorm_order_view.php — Ztorm GetOrder(Value->Order) 평탄화. 가격 Value는 정수, end_time은 포맷 문자열.
export type OrderZtormViewInfo = {
  country_code: string; // CountryCode
  customer_ip: string; // CustomerIP
  end_time: string; // EndTime.UnixTimestamp → 'Y-m-d H:i:s'(백엔드 포맷)
  is_test: string; // IsTest
  is_refund: string; // IsRefund
  retailer_customer_id: string; // RetailerCustomerID
  retailer_order_id: string; // RetailerOrderID
  customer_product_id: string; // Contents.OrderContent.CustomerProducts.CustomerProductID
  is_refunded: string; // Contents.OrderContent.IsRefunded
  product_id: string; // Contents.OrderContent.ProductID
  product_price_ex_vat_value: number; // ProductPriceExVAT.Value(number_format)
  product_price_ex_vat_currency: string; // ProductPriceExVAT.Currency
  product_price_inc_vat_value: number; // ProductPriceIncVAT.Value(number_format)
  product_price_inc_vat_currency: string; // ProductPriceIncVAT.Currency
  vat_percent: string; // VATPercent
};

export type OrderZtormViewResponse = {
  found: boolean; // ErrorCode==0
  order: OrderZtormViewInfo | null; // 조회성공 시 order, 실패 시 null
  error: string; // 조회실패 시 ErrorMsg(alert-danger 노출)
};

// ztorm_order_view.php GET 파라미터
export type OrderZtormViewSearch = {
  search_type: string; // ordno | item_order_id
  search_value: string;
};

// legacy getOrderGenbaSuccess SELECT(tbl_order_item_genba, product_code>0)
export type OrderGenbaSuccessItem = {
  ordno: string; // 주문번호
  ord_ymd: string; // 주문일자(2줄 표기 + 기간 필터)
  m_id: string; // 회원아이디
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명(text-wrap)
  sku: string; // Sku
  name: string; // Genba 상품명(text-wrap)
  platform: string; // Platform(뱃지)
  publisher: string; // Publisher(뱃지)
  genba_order_id: string; // ID(Genba Order ID)
  reservation_id: string; // ReservationID
  shipped_at: string; // Created +9h → 'Y-m-d H:i:s'(백엔드 포맷) 발송일자
  state: string; // State("0"품절/"1"예약구매/"2"완료), "0"이면 bg-danger
};

export type OrderGenbaSuccessResponse = {
  items: OrderGenbaSuccessItem[];
  pagination: OrderPagination;
};

// order_genba_success.php GET 파라미터
export type OrderGenbaSuccessSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy genba_order_view.php — Genba GetOrder 응답의 중첩 Keys 항목.
export type OrderGenbaViewKey = {
  code: string; // Code
  key_type: string; // KeyType
  sku: string; // Sku
  product_name: string; // ProductName
};

// legacy genba_order_view.php — Genba GetOrder 응답 평탄화. 가격 Amount는 정수, created는 포맷 문자열.
export type OrderGenbaViewInfo = {
  client_transaction_id: string; // ClientTransactionID
  order_id: string; // ID(Order ID)
  reservation_id: string; // ReservationID
  sku: string; // Sku
  created: string; // Created UTC→Asia/Seoul 'Y-m-d H:i:s'(백엔드 포맷)
  state: string; // State(raw, State* 컬럼)
  communicated_buying_price_amount: number; // CommunicatedBuyingPrice.Amount
  communicated_buying_price_currency: string; // CommunicatedBuyingPrice.CurrencyCode
  actual_buying_price_amount: number; // ActualBuyingPrice.Amount
  actual_buying_price_currency: string; // ActualBuyingPrice.CurrencyCode
  selling_price_gross_amount: number; // SellingPrice.GrossAmount(del 표기)
  selling_price_net_amount: number; // SellingPrice.NetAmount
  selling_price_currency: string; // SellingPrice.CurrencyCode
  keys: OrderGenbaViewKey[]; // Keys[]
};

export type OrderGenbaViewResponse = {
  found: boolean; // rst.ID != ""
  order: OrderGenbaViewInfo | null; // 조회성공 시 order, 실패 시 null
  error: string; // 조회실패 시 API 메시지(alert-danger)
};

// genba_order_view.php GET 파라미터
export type OrderGenbaViewSearch = {
  search_type: string; // ordno | item_order_id | client_transaction_id
  search_value: string;
};

// legacy getOrderVaultnSuccess SELECT(tbl_order_item_vaultn, product_code>0)
export type OrderVaultnSuccessItem = {
  client_order_reference: string; // clientOrderReference(주문번호)
  ord_ymd: string; // 주문일자(2줄 표기 + 기간 필터)
  m_id: string; // 회원아이디
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명(text-wrap 25rem)
  sku: string; // sku
  name: string; // Vaultn 상품명(text-wrap 25rem)
  provider: string; // provider(뱃지)
  publisher_name: string; // publisherName(뱃지)
  order_id: string; // orderId(Vaultn Order ID)
  reg_date: string; // reg_date(발송일자)
  status: string; // status(State, raw 값 — 라벨 매핑 없음)
};

export type OrderVaultnSuccessResponse = {
  items: OrderVaultnSuccessItem[];
  pagination: OrderPagination;
};

// order_vaultn_success.php GET 파라미터(개별 input 2종 + 기간)
export type OrderVaultnSuccessSearch = {
  page: number;
  search_ordno: string;
  search_m_id: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy vaultn_order_view.php — orderDetails.priceListDetails 중첩. 정수/실수 포맷은 화면에서.
export type OrderVaultnViewPriceList = {
  publisher_name: string; // publisherName
  publisher_guid: string; // publisherGuid(text-break)
  price_model: string; // priceModel
  price_list_guid: string; // priceListGuid(text-break)
  country_code: string; // countryCode
  srp_currency: string; // srpCurrency
  purchase_price_currency: string; // purchasePriceCurrency
  base_srp: number; // baseSRP(int)
  discounted_srp: number; // discountedSRP(int)
  net_discounted_srp: number; // netDiscountedSRP(float,2)
  price_list_vat: string; // priceListVAT(raw)
  base_purchase_price: number; // basePurchasePrice(float,2)
  promo_percentage: string; // promoPercentage(raw)
  net_purchase_price: number; // netPurchasePrice(float,2)
  estimated_margin: number; // estimatedMargin(float,2)
};

// legacy vaultn_order_view.php — orderDetails 중첩.
export type OrderVaultnViewOrderDetails = {
  sales_currency: string; // salesCurrency
  sales_country: string; // salesCountry
  sales_country_code: string; // salesCountryCode
  sales_price_gross: number; // salesPriceGross(int)
  sales_price_net: number; // salesPriceNet(truthy면 int, falsy면 "")
  applied_discount_percentage: string; // appliedDiscountPercentage(raw)
  applied_discount_amount: number; // appliedDiscountAmount(truthy면 int, falsy면 "")
  price_list_details: OrderVaultnViewPriceList;
};

// legacy vaultn_order_view.php — Vaultn RetrieveOrder 응답 평탄화.
export type OrderVaultnViewInfo = {
  order_id: string; // orderId
  client_order_reference: string; // clientOrderReference
  client_customer_reference: string; // clientCustomerReference
  created: string; // Created UTC→Asia/Seoul 'Y-m-d H:i:s'(백엔드 포맷)
  status: string; // status
  order_details: OrderVaultnViewOrderDetails;
};

export type OrderVaultnViewResponse = {
  found: boolean; // rst.orderId != ""
  order: OrderVaultnViewInfo | null;
  error: string; // 백엔드 API 메시지(단, 화면은 legacy 버그로 미표시)
};

// vaultn_order_view.php GET 파라미터
export type OrderVaultnViewSearch = {
  search_type: string; // ordno | item_order_id
  search_value: string;
};

// ── legacy order_view.php(주문 상세) 집계 조회 ── 217a 읽기전용 스코프.
// 항목별 키 발송현황(디지털, delivery_type 1/3) — 시스템 5종.
export type OrderDetailAssetItem = {
  asset_id: string;
  asset_name: string;
  asset_platform: string;
  asset_publisher: string;
  reserve_id: string;
};
export type OrderDetailZtormItem = {
  ztorm_item_id: string;
  ztorm_item_name: string;
  ztorm_publisher: string;
  ztorm_platform: string;
  customer_product_id: string;
};
export type OrderDetailGenbaItem = {
  sku: string;
  name: string;
  platform: string;
  publisher: string;
  id: string; // Genba Order ID
  client_transaction_id: string;
  state: string; // 0품절/1예약구매/2주문완료/3환불완료
};
export type OrderDetailVaultnItem = {
  sku: string;
  name: string;
  provider: string;
  publisher_name: string;
  order_id: string;
  status: string; // raw
};
export type OrderDetailPointNexusItem = {
  action: string; // sell/book/confirm/bookCancel/cancel/reveal (뱃지 색)
  product_id: string;
  name: string;
  license_platform: string;
  operation_id: string;
  parent_operation_id: string; // 있으면 child
  status: string; // sold/booked/... (뱃지 색)
  mode: string;
  idx: string;
};
// 항목별 배송현황(실물, delivery_type 2/3).
export type OrderDetailDeliveryItem = {
  model_code: string;
  model_name: string;
  shipment_status: string; // getShipmentStatus 라벨(8·9 red)
  tracking_number: string;
  shipment_company_name: string;
  shipped_date: string;
  estimated_delivery_date: string;
  actual_delivery_date: string;
  delivery_code: string;
};

// 주문항목(getOrderItem 1행 + 발송/배송 현황).
export type OrderDetailItem = {
  ordno: string;
  product_code: string;
  product_name: string;
  repay: number; // 적립
  goods_price: number; // 정상가
  price: number; // 판매가
  status: string; // 주문상태(getOrderStatus, 8·9 red)
  is_actv: string; // 수령상태(1=수령완료)
  completion_date: string; // 수령일
  delivery_type: string; // 1 디지털 / 2 실물 / 3 둘다
  order_system: string; // Asset/Ztorm/Genba/Vaultn/PointNexus
  send_status: string;
  order_date: string;
  asset: OrderDetailAssetItem[];
  ztorm: OrderDetailZtormItem[];
  genba: OrderDetailGenbaItem[];
  vaultn: OrderDetailVaultnItem[];
  pointnexus: OrderDetailPointNexusItem[];
  delivery: OrderDetailDeliveryItem[];
};

// 주문/결제 헤더(getOrderInfo).
export type OrderDetailInfo = {
  settle_no: string;
  m_no: string;
  m_id: string;
  is_mobile: string; // N=PC
  ip: string;
  country: string; // getCountry(ip) geoip
  reg_date: string; // 주문생성일
  pg_provider: string;
  payment_method: string; // getSettlekindLabel
  use_emoney: number;
  use_cash: number;
  member_dc: number;
  total_price: number; // 최종 결제금액
  step: string; // getCheckoutStatus
  payment_date: string;
  version: string;
};

export type OrderDetailAddress = {
  zipcode: string;
  address: string;
  address_detail: string;
  name: string;
  tel: string;
  msg: string;
};

export type OrderDetailLog = {
  ordno: string;
  admin_id: string;
  reg_date: string;
  memo: string;
};

// legacy settle_log 단건 — PG 공용 superset(KCP 217c-1 / Toss 217c-2 …). PG별 사용 필드만 채움.
export type OrderDetailSettleLog = {
  settle_no: string;
  tno: string; // KCP 거래 고유번호
  tx_cd: string; // KCP 상태코드
  pay_method: string; // 결제수단명
  escw_yn: string; // 에스크로여부
  amount: number; // 결제금액/가상계좌 입금예정금액
  partcanc_yn: string; // 부분취소 가능 유무
  // SC0010 신용카드
  isp_issuer_nm: string;
  card_name: string;
  card_bin_type_01: string; // 0 개인 / else 법인
  card_bin_type_02: string; // 0 신용 / else 체크
  card_no: string;
  card_mny: number;
  coupon_mny: number;
  payco_point_mny: number;
  app_no: string;
  app_time: string;
  // SC0030 계좌이체
  bank_name: string;
  bank_code: string;
  bk_mny: string; // raw
  cash_authno: string;
  cash_no: string;
  // SC0040 가상계좌
  ipgm_name: string;
  account: string;
  depositor: string;
  va_date: string; // YmdHis
  ipgm_mnyx: string; // raw
  totl_mnyx: string; // raw
  ipgm_time: string;
  noti_id: string;
  op_cd: string;
  remitter: string;
  cash_a_no: string;
  // SC0060 휴대폰
  commid: string;
  mobile_no: string;
  van_id: string;
  // Toss(217c-2) — toss_adapter_log(toss_bank) / toss_log(일반). 위 kcp 필드 일부(bank_name/bank_code/coupon_mny/bk_mny/cash_authno/cash_no/app_time/tno/escw_yn) 공용.
  method: string; // 일반 toss 결제수단
  total_amount: number; // 총 결제금액
  ba: number; // 즉시할인 금액(일반 toss)
  balance_amount: number; // 취소 가능금액
  requested_at: string; // 결제 시간
  approved_at: string; // 승인 시간
  payment_key: string; // toss_refund paymentKey
  // Tosspay(217c-3) — tosspay_log. amount·pay_method(payMethod) 공용 재사용.
  discounted_amount: number; // discountedAmount 할인 금액
  paid_amount: number; // paidAmount 취소가능금액/결제금액
  paid_ts: string; // paidTs 결제완료처리 시간
  pay_token: string; // payToken(tosspay_refund)
  // NaverPay(217c-5) — naverpay_log. card_no(공용) 재사용. 금액은 raw 문자열 표시.
  payment_id: string; // paymentId
  admission_type_code: string; // 01 원결제 승인/03 전체취소/04 부분취소
  admission_ymdt: string; // 결제/취소 일시
  trade_confirm_ymdt: string; // 거래 완료 일시
  total_pay_amount: string; // 총 결제/취소 금액(cancelAmount)
  apply_pay_amount: string; // 구매자 결제/취소 금액
  primary_pay_amount: string; // 주 결제 수단 결제/취소 금액
  npoint_pay_amount: string; // 포인트/머니 결제/취소 금액
  discount_pay_amount: string; // 즉시 할인 결제/취소 금액
  primary_pay_means: string; // 주 결제 수단(CARD/BANK)
  card_corp_code: string; // 카드사
  card_auth_no: string; // 카드승인번호
  bank_corp_code: string; // 은행
  bank_account_no: string; // 계좌 번호
  // 공통(217g)
  imp_uid: string; // 아임포트 주문번호(있을 때만 표시)
};

// legacy Payco paymentDetails[] 항목(217c-4). settle-info 5종은 미존재 시 null.
export type OrderDetailPaycoPaymentDetail = {
  payment_method_name: string; // paymentMethodName
  payment_amt: number; // paymentAmt
  trade_ymdt: string; // 결제일시
  pg_admission_no: string; // 결제 승인번호
  pg_admission_ymdt: string; // 결제 승인일시
  easy_payment_yn: string; // 간편결제여부
  taxable_amt: number; // 공급가액
  vat_amt: number; // 부가세
  card_settle_info: {
    card_company_name: string;
    card_company_code: string;
    card_no: string;
    card_installment_month_number: string;
    card_admission_no: string;
    card_interest_free_yn: string;
    corporate_card_yn: string;
    part_cancel_possible_yn: string;
    acquirers_corporation_code: string;
  } | null;
  cellphone_settle_info: { company_name: string; cellphone_no: string } | null;
  realtime_account_transfer_settle_info: { bank_name: string; bank_code: string } | null;
  non_bankbook_settle_info: {
    bank_name: string;
    bank_code: string;
    account_no: string;
    payment_expiration_ymd: string;
  } | null; // step 1·8이면 계좌반납(payco_cancel)
  coupon_settle_info: { discount_amt: string; discount_condition_amt: string } | null;
};

export type OrderDetailResponse = {
  order: OrderDetailInfo | null; // 미존재 settle_no → null
  items: OrderDetailItem[];
  address: OrderDetailAddress | null; // zipcode 없으면 null
  logs: OrderDetailLog[];
  settle_log: OrderDetailSettleLog | null; // PG별 settle_log(kcp/toss …). 미해당 PG는 후속.
  payco: OrderDetailPaycoInfo | null; // pg_provider=payco 시 결제 상세(217c-4).
};

// legacy Payco 결제정보(payco_log + paymentDetails json). 217c-4.
export type OrderDetailPaycoInfo = {
  reserve_order_no: string; // reserveOrderNo
  order_no: string; // orderNo
  member_name: string; // memberName
  member_email: string; // memberEmail
  total_order_amt: number; // totalOrderAmt
  total_payment_amt: number; // cancelTotalAmt
  order_certify_key: string; // orderCertifyKey
  seller_order_reference_key: string; // 영수증 링크
  payment_details: OrderDetailPaycoPaymentDetail[];
};

// legacy kcp_refund POST(order_ps.php). 결제취소/계좌반납 공용.
export type OrderKcpRefundRequest = {
  settle_no: string;
  mod_type: string; // STSC | STE2
  tno: string;
};

// legacy toss_adapter_refund POST(toss_bank 계좌이체 결제취소).
export type OrderTossAdapterRefundRequest = {
  settle_no: string;
  mod_type: string; // STSC
  tno: string;
};

// legacy toss_refund POST(일반 toss, 부분취소 모달). cancel_amount 빈값=전액.
export type OrderTossRefundRequest = {
  settle_no: string;
  payment_key: string;
  cancel_amount: string;
};

// legacy tosspay_refund POST(토스페이 부분취소 모달). refundNo는 백엔드 생성.
export type OrderTosspayRefundRequest = {
  settle_no: string;
  pay_token: string;
  cancel_amount: string;
};

// legacy payco_refund/payco_cancel POST(paycoFrm 공용). 결제취소/계좌반납.
export type OrderPaycoRefundRequest = {
  settle_no: string;
  order_no: string; // orderNo
  cancel_total_amt: number; // cancelTotalAmt(totalPaymentAmt)
  order_certify_key: string; // orderCertifyKey
};

// legacy naverpay_refund POST(naverpayFrm). 모달 없음(confirm만).
export type OrderNaverpayRefundRequest = {
  settle_no: string;
  payment_id: string; // paymentId
  cancel_amount: string; // cancelAmount(totalPayAmount)
};

// legacy order_item_cancel POST(cancelFrm). 주문항목 취소. admin_id/order_status는 백엔드.
export type OrderItemCancelRequest = {
  settle_no: string;
  ordno: string;
  delivery_type: string;
  order_system: string;
  message: string; // 처리사유
};

// legacy order_reject POST(반려). admin_id는 백엔드.
export type OrderRejectRequest = {
  settle_no: string;
  ordno: string;
  payment_method: string;
};

// legacy resend POST(재발송/키발급 재시도).
export type OrderResendRequest = {
  settle_no: string;
  ordno: string;
};

// legacy register_tracking_no_item POST(운송장 등록).
export type OrderTrackingRegisterRequest = {
  settle_no: string;
  ordno: string;
  escw_yn: string;
  payment_method: string;
  delivery_code: string; // 001 CJ / 002 로젠
  tracking_no: string;
};

// legacy memo_add POST(관리자 메모). admin_id는 백엔드. legacy는 성공 시 reload 안 함(quirk).
export type OrderMemoAddRequest = {
  settle_no: string;
  memo_gubun: string; // 일반/취소환불/차액환불
  ordno: string;
  message: string;
};

// legacy point_refund/order_refund POST(사용적립금 반환 / 결제취소+적립금 반환 공용).
export type OrderPointRefundRequest = {
  settle_no: string;
  use_emoney: number;
};

// legacy order_detail.php(PaycoPG::paycoGetDetailForVerify) — 결제 상세정보 검증용 덤프.
export type OrderPaycoDetailRequest = {
  reserve_order_no: string;
  seller_order_reference_key: string;
};
export type OrderPaycoDetailResponse = {
  detail: unknown; // debug 덤프(Payco 검증 응답 원본). 팝업에 JSON으로 표시.
};

// order_view.php GET 파라미터
export type OrderDetailSearch = {
  settle_no: string;
};

// ── legacy order_licence.php(키확인 AJAX) ── 217b.
export type OrderLicenceRequest = {
  mode: string; // getAssetLicence | getPointNexusLicence
  item_order_id: string; // Asset=reserve_id / PointNexus=idx
};
// getAssetLicence — Asset.runReserveAdmin 결과.
export type OrderAssetLicence = {
  title: string;
  key: string;
  activated_dt: string;
};
// getPointNexusLicence — tbl_order_item_pointnexus + 라이브 조회(실패 시 DB 폴백).
export type OrderPointNexusLicence = {
  found: boolean; // idx row 존재
  name: string; // Name
  source: string; // live | db_fallback
  error: string; // db_fallback 시 오류 메시지
  status: string; // sold/confirmed/booked/pending_reveal/canceled/failed
  license_key: string;
  license_platform: string;
};
export type OrderLicenceResponse = {
  mode: string;
  asset: OrderAssetLicence | null;
  pointnexus: OrderPointNexusLicence | null;
};

// legacy order_asset_key.php — 단건 조회(주문 요약 + Asset 키). 페이지네이션 없음.
export type OrderAssetKeyOrderInfo = {
  ordno: string;
  settle_no: string;
  product_code: string;
  product_name: string;
  status: string;
  is_actv: string; // 1=활성화 / else 미활성
  order_system: string;
  m_id: string;
};

export type OrderAssetKeyRow = {
  product: string;
  asset_id: string;
  publisher: string;
  reserve_id: string;
  key: string | null; // null=조회 실패
  activated: boolean | null; // true/false/null(-)
  activatedDt: string;
  po: string;
};

export type OrderAssetKeyResponse = {
  order_info: OrderAssetKeyOrderInfo | null; // null=주문 항목 없음(경고)
  key_rows: OrderAssetKeyRow[];
};

// legacy order_asset_key_bulk.php — 여러 ordno 일괄 조회 결과 행(found=false면 키 없음).
export type OrderAssetKeyBulkRow = {
  ordno: string;
  found: boolean;
  key: string | null; // found=true일 때, null=조회 실패
};

export type OrderAssetKeyBulkResponse = {
  result_rows: OrderAssetKeyBulkRow[];
  matched_ordno_count: number;
  key_count: number;
};

// order_shipment_all.php GET 파라미터 (배송상태 radio 포함)
export type OrderShipmentAllSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
  search_shipment_status: string;
};

// order_shipment_{pending,ready,shipping,delivered,confirm}.php GET 파라미터 (배송상태 고정 → radio 없음)
export type OrderShipmentFixedSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

export type OrderShipmentFixedResponse = {
  items: OrderShipmentItem[];
  pagination: OrderPagination;
};

// legacy getOrderSuccess SELECT(tbl_order_item 단일, status='2'). **is_mobile 미SELECT → M뱃지 죽은 코드**.
export type OrderSuccessItem = {
  order_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  ordno: string; // 주문번호
  m_id: string; // 회원아이디
  ip: string; // 주문IP
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명 (M뱃지는 is_mobile 미SELECT로 죽은 코드)
  price: number; // 주문금액
  status: string; // 주문상태 (getOrderStatus, status='2' 고정)
  is_actv: string; // 수령여부 (0=수령대기 / else 수령완료)
  delivery_type: string; // 배송유형 (getDeliveryType)
  order_system: string; // 연동시스템 (bg-danger 판정용)
};

export type OrderSuccessResponse = {
  items: OrderSuccessItem[];
  pagination: OrderPagination;
};

// legacy getOrderCancelRequest SELECT(tbl_order⋈tbl_order_item, status IN 7,8 취소요청)
export type OrderCancelRequestItem = {
  order_date: string; // 주문일자
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  ordno: string; // 주문번호
  m_id: string; // 회원아이디 (IP 없음)
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명
  is_mobile: string; // Y=M 뱃지
  price: number; // 주문금액
  status: string; // 주문상태 (getOrderStatus, 8=취소요청/7=빈셀)
  delivery_type: string; // 배송유형 (getDeliveryType)
};

export type OrderCancelRequestResponse = {
  items: OrderCancelRequestItem[];
  pagination: OrderPagination;
};

// order_cancel_request.php GET 파라미터 (기본 전체기간, 연동시스템/수령여부 없음)
export type OrderCancelRequestSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
};

// legacy getOrderCancelComplete SELECT(tbl_order⋈tbl_order_item, status='9' 취소완료)
export type OrderCancelCompleteItem = {
  cancel_date: string; // 취소완료일자
  ord_ymd: string; // 구매일(취소완료일자 셀 2줄)
  settle_no: string; // 결제번호 (order_view 링크 — 미이관)
  ordno: string; // 주문번호
  m_id: string; // 회원아이디 (IP 없음)
  product_code: string; // 옵션상품코드
  product_name: string; // 상품명
  is_mobile: string; // Y=M 뱃지
  price: number; // 주문금액
  status: string; // 주문상태 (getOrderStatus, status='9' 고정)
  delivery_type: string; // 배송유형 (getDeliveryType)
};

export type OrderCancelCompleteResponse = {
  items: OrderCancelCompleteItem[];
  pagination: OrderPagination;
};

// order_cancel_complete.php GET 파라미터 (정렬순서·기간유형·PG·결제수단)
export type OrderCancelCompleteSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  search_pg_provider: string;
  search_payment_method: string;
  search_orderby: string;
  search_date_type: string;
  date_label: string;
};

// legacy getOrderOldList SELECT(DGKR 아카이브 tbl_order_{year}⋈tbl_order_item_{year})
export type OrderOldListItem = {
  settle_no: string; // 결제번호 (order_old_view 링크 — 미이관)
  ord_ymd: string; // 주문일자
  ordno: string; // 주문번호
  email: string; // 회원아이디(email 컬럼)
  product_nm: string; // 상품명
  supp_cd: string; // 공급구분(4/5=번들 라벨)
  tot_pay: number; // 주문금액
  step: string; // 결제상태(settleStatus2) + 결제일자 표시 분기(step!='1')
  cdt: string; // 결제일자
  settlekind: string; // 결제방법(settlekind2)
  pg_provider: string; // PG (raw)
  status: string; // 주문상태(orderStatus)
  is_lic_actv: string; // 키확인(1=O/else X)
};

export type OrderOldListResponse = {
  items: OrderOldListItem[];
  pagination: OrderPagination;
};

// order_old_list.php GET 파라미터 (연도 기반, 날짜 무조건 전체기간)
export type OrderOldListSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
  search_year: string;
};

// order_success.php GET 파라미터 (order_all + 수령여부/배송유형/금액 필터)
export type OrderSuccessSearch = {
  page: number;
  search_key: string;
  search_value: string;
  search_start_date: string;
  search_end_date: string;
  date_label: string;
  order_system: string;
  search_is_actv: string;
  search_delivery_type: string; // 숨은 필터(폼 UI 없음)
  search_price_min: string; // 숨은 필터
  search_price_max: string; // 숨은 필터
};
