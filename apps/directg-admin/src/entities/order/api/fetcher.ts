import { apiClient } from "@shared/api/client";
import type {
  OrderPaymentReadyResponse,
  OrderPaymentReadySearch,
  OrderPaymentApprovedResponse,
  OrderVbankResponse,
  OrderVbankSearch,
  OrderAllResponse,
  OrderAllSearch,
  OrderReadyResponse,
  OrderReadySearch,
  OrderSuccessResponse,
  OrderSuccessSearch,
  OrderCancelRequestResponse,
  OrderCancelRequestSearch,
  OrderCancelCompleteResponse,
  OrderCancelCompleteSearch,
  OrderOldListResponse,
  OrderOldListSearch,
  OrderShipmentAllResponse,
  OrderShipmentAllSearch,
  OrderShipmentFixedResponse,
  OrderShipmentFixedSearch,
  OrderShipmentShippingRequest,
  OrderShipmentShippedRequest,
  OrderAssetSuccessResponse,
  OrderAssetSuccessSearch,
  OrderZtormSuccessResponse,
  OrderZtormSuccessSearch,
  OrderZtormViewResponse,
  OrderZtormViewSearch,
  OrderGenbaSuccessResponse,
  OrderGenbaSuccessSearch,
  OrderGenbaViewResponse,
  OrderGenbaViewSearch,
  OrderVaultnSuccessResponse,
  OrderVaultnSuccessSearch,
  OrderVaultnViewResponse,
  OrderVaultnViewSearch,
  OrderDetailResponse,
  OrderDetailSearch,
  OrderLicenceRequest,
  OrderLicenceResponse,
  OrderKcpRefundRequest,
  OrderTossAdapterRefundRequest,
  OrderTossRefundRequest,
  OrderTosspayRefundRequest,
  OrderPaycoRefundRequest,
  OrderNaverpayRefundRequest,
  OrderItemCancelRequest,
  OrderRejectRequest,
  OrderResendRequest,
  OrderTrackingRegisterRequest,
  OrderMemoAddRequest,
  OrderPointRefundRequest,
  OrderPaycoDetailRequest,
  OrderPaycoDetailResponse,
  OrderAssetKeyResponse,
  OrderAssetKeyBulkResponse,
} from "../model/types";

// 고정상태 배송화면(pending/ready/shipping/delivered/confirm) 공용 파라미터 빌드.
const buildShipmentFixedParams = (query: OrderShipmentFixedSearch): Record<string, string> => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return searchParams;
};

// order_step1/step2 공통 검색 파라미터 빌드(빈값/all 미전송). settle_no·m_id 우선 기간무시는
// 화면에서 resolveOrderPaymentReadySearch로 완료된 값이 들어온다.
const buildOrderSearchParams = (query: OrderPaymentReadySearch): Record<string, string> => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const setStr = (key: string, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  setStr("search_settle_no", query.search_settle_no);
  setStr("search_m_id", query.search_m_id);
  if (query.search_pg_provider !== "" && query.search_pg_provider !== "all")
    searchParams.search_pg_provider = query.search_pg_provider;
  if (query.search_payment_method !== "" && query.search_payment_method !== "all")
    searchParams.search_payment_method = query.search_payment_method;
  setStr("search_start_date", query.search_start_date);
  setStr("search_end_date", query.search_end_date);
  return searchParams;
};

// legacy order_step1.php + AdminOrder::getOrderPaymentReady — tbl_order step='1' 입금대기 목록(20/page).
// 빈값/중립값(all)은 미전송. 백엔드가 WHERE 빌드(등호 규칙·step='1' 고정·reg_date desc는 계약 참조).
// settle_no/m_id 우선 기간무시 정규화는 화면에서 resolveOrderPaymentReadySearch로 완료된 값이 들어온다.
export const fetchOrderPaymentReady = (query: OrderPaymentReadySearch) =>
  apiClient.get<OrderPaymentReadyResponse>("/admin/order/payment-ready", {
    searchParams: buildOrderSearchParams(query),
  });

// legacy order_step2.php + AdminOrder::getOrderPaymentApproved — tbl_order step='2' 결제완료 목록(20/page).
// step='2' 고정·payment_date desc는 백엔드 책임(계약 참조).
export const fetchOrderPaymentApproved = (query: OrderPaymentReadySearch) =>
  apiClient.get<OrderPaymentApprovedResponse>("/admin/order/payment-approved", {
    searchParams: buildOrderSearchParams(query),
  });

// legacy order_vbank.php + AdminOrder::getOrderVbankReady — tbl_order⋈kcp_log⋈payco_log step='1' 가상계좌(20/page).
// PG/결제수단 필터 없음. step='1' 고정·가상계좌 발급건만·reg_date desc는 백엔드 책임(계약 참조).
export const fetchOrderVbank = (query: OrderVbankSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  const setStr = (key: string, value: string) => {
    if (value !== "") searchParams[key] = value;
  };
  setStr("search_settle_no", query.search_settle_no);
  setStr("search_m_id", query.search_m_id);
  setStr("search_start_date", query.search_start_date);
  setStr("search_end_date", query.search_end_date);
  return apiClient.get<OrderVbankResponse>("/admin/order/vbank", { searchParams });
};

// legacy order_all.php + AdminOrder::getOrderAll — tbl_order⋈tbl_order_item 주문통합 목록(20/page).
// order_date desc·a.m_no>0는 백엔드 책임(계약 참조). search_value 있을 때만 search_key 동반 전송.
export const fetchOrderAll = (query: OrderAllSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.order_system !== "" && query.order_system !== "all")
    searchParams.order_system = query.order_system;
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderAllResponse>("/admin/order/all", { searchParams });
};

// legacy order_ready.php + AdminOrder::getOrderReadyList — step=2·send_status=fail·status=1 재처리 대기(20/page).
// 검색필터 없음. 조건·order_date desc는 백엔드 책임(계약 참조).
export const fetchOrderReadyList = (query: OrderReadySearch) =>
  apiClient.get<OrderReadyResponse>("/admin/order/ready", {
    searchParams: { page: String(query.page) },
  });

// legacy order_success.php + AdminOrder::getOrderSuccess — tbl_order_item status='2' 주문완료(20/page).
// order_all + 수령여부/배송유형/금액 필터. status='2' 고정·order_date desc는 백엔드 책임(계약 참조).
export const fetchOrderSuccess = (query: OrderSuccessSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.order_system !== "" && query.order_system !== "all")
    searchParams.order_system = query.order_system;
  if (query.search_is_actv !== "") searchParams.search_is_actv = query.search_is_actv;
  if (query.search_delivery_type !== "")
    searchParams.search_delivery_type = query.search_delivery_type;
  if (query.search_price_min !== "") searchParams.search_price_min = query.search_price_min;
  if (query.search_price_max !== "") searchParams.search_price_max = query.search_price_max;
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderSuccessResponse>("/admin/order/success", { searchParams });
};

// legacy order_cancel_request.php + AdminOrder::getOrderCancelRequest — status IN(7,8) 취소요청(20/page).
// status IN(7,8) 고정·order_date desc는 백엔드 책임(계약 참조).
export const fetchOrderCancelRequest = (query: OrderCancelRequestSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderCancelRequestResponse>("/admin/order/cancel-request", { searchParams });
};

// legacy order_cancel_complete.php + AdminOrder::getOrderCancelComplete — status='9' 취소완료(20/page).
// status='9' 고정·orderby(cancel_date/order_date)·date_type별 기간 컬럼은 백엔드 책임(계약 참조).
export const fetchOrderCancelComplete = (query: OrderCancelCompleteSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  searchParams.search_orderby = query.search_orderby;
  searchParams.search_date_type = query.search_date_type;
  if (query.search_pg_provider !== "" && query.search_pg_provider !== "all")
    searchParams.search_pg_provider = query.search_pg_provider;
  if (query.search_payment_method !== "" && query.search_payment_method !== "all")
    searchParams.search_payment_method = query.search_payment_method;
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderCancelCompleteResponse>("/admin/order/cancel-complete", {
    searchParams,
  });
};

// legacy order_old_list.php + AdminOrder::getOrderOldList — DGKR 아카이브 연도별 과거주문(20/page).
// 연도별 테이블·a.m_no>0·ord_ymd desc는 백엔드 책임. 날짜는 항상 전체기간(미전송, 연도로만 조회).
export const fetchOrderOldList = (query: OrderOldListSearch) => {
  const searchParams: Record<string, string> = {
    page: String(query.page),
    search_year: query.search_year,
  };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  return apiClient.get<OrderOldListResponse>("/admin/order/old", { searchParams });
};

// legacy order_shipment_all.php + AdminOrder::getOrderShipmentAll — 택배 배송 통합(20/page).
// 3중 조인·step=2·status=2·delivery_type≠1·order_item_id desc는 백엔드 책임(계약 참조).
export const fetchOrderShipmentAll = (query: OrderShipmentAllSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.search_shipment_status !== "" && query.search_shipment_status !== "all")
    searchParams.search_shipment_status = query.search_shipment_status;
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderShipmentAllResponse>("/admin/order/shipment-all", { searchParams });
};

// legacy order_shipment_pending.php + AdminOrder::getOrderShipmentPending — shipment_status='2' 고정(20/page).
export const fetchOrderShipmentPending = (query: OrderShipmentFixedSearch) =>
  apiClient.get<OrderShipmentFixedResponse>("/admin/order/shipment-pending", {
    searchParams: buildShipmentFixedParams(query),
  });

// legacy order_shipment_ready.php + AdminOrder::getOrderShipmentReady — shipment_status='3' 고정(20/page).
export const fetchOrderShipmentReady = (query: OrderShipmentFixedSearch) =>
  apiClient.get<OrderShipmentFixedResponse>("/admin/order/shipment-ready", {
    searchParams: buildShipmentFixedParams(query),
  });

// legacy order_ps.php mode=shipment_shipping — 선택 배송준비 → 배송중 일괄 전환(shipment_status 3→4 + 에스크로 PG 배송등록은 백엔드).
export const shipOrderShipment = (payload: OrderShipmentShippingRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/shipment/shipping", payload);

// legacy order_shipment_shipping.php + AdminOrder::getOrderShipmentShipping — shipment_status='4' 고정(20/page).
export const fetchOrderShipmentShipping = (query: OrderShipmentFixedSearch) =>
  apiClient.get<OrderShipmentFixedResponse>("/admin/order/shipment-shipping", {
    searchParams: buildShipmentFixedParams(query),
  });

// legacy order_ps.php mode=shipment_shipped — 선택 배송중 → 배송완료 일괄 전환(shipment_status 4→5는 백엔드).
export const shipCompleteOrderShipment = (payload: OrderShipmentShippedRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/shipment/shipped", payload);

// legacy order_shipment_delivered.php + AdminOrder::getOrderShipmentDelivered — shipment_status='5' 고정(20/page).
export const fetchOrderShipmentDelivered = (query: OrderShipmentFixedSearch) =>
  apiClient.get<OrderShipmentFixedResponse>("/admin/order/shipment-delivered", {
    searchParams: buildShipmentFixedParams(query),
  });

// legacy order_ps.php mode=actual_delivery — 선택 배송완료 → 구매확정 일괄 전환(shipment_status 5→6은 백엔드).
export const confirmPurchaseOrderShipment = (payload: OrderShipmentShippedRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/shipment/actual-delivery", payload);

// legacy order_shipment_confirm.php + AdminOrder::getOrderShipmentConfirm — shipment_status='6' 고정(20/page, 읽기전용).
export const fetchOrderShipmentConfirm = (query: OrderShipmentFixedSearch) =>
  apiClient.get<OrderShipmentFixedResponse>("/admin/order/shipment-confirm", {
    searchParams: buildShipmentFixedParams(query),
  });

// legacy order_asset_success.php + AdminOrder::getOrderAssetSuccess — tbl_order_item_asset 주문완료(20/page).
export const fetchOrderAssetSuccess = (query: OrderAssetSuccessSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderAssetSuccessResponse>("/admin/order/asset-success", { searchParams });
};

// legacy order_ztorm_success.php + AdminOrder::getOrderZtormSuccess — tbl_order_item_ztorm 주문완료(20/page).
export const fetchOrderZtormSuccess = (query: OrderZtormSuccessSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_ordno !== "") searchParams.search_ordno = query.search_ordno;
  if (query.search_ztorm_id !== "") searchParams.search_ztorm_id = query.search_ztorm_id;
  if (query.search_m_id !== "") searchParams.search_m_id = query.search_m_id;
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderZtormSuccessResponse>("/admin/order/ztorm-success", { searchParams });
};

// legacy ztorm_order_view.php + Ztorm::runGetOrder — 단건 조회(외부 GetOrder API). search_value 있을 때만 호출.
export const fetchOrderZtormView = (query: OrderZtormViewSearch) =>
  apiClient.get<OrderZtormViewResponse>("/admin/order/ztorm-order-view", {
    searchParams: { search_type: query.search_type, search_value: query.search_value },
  });

// legacy order_genba_success.php + AdminOrder::getOrderGenbaSuccess — tbl_order_item_genba 주문완료(20/page).
export const fetchOrderGenbaSuccess = (query: OrderGenbaSuccessSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_value !== "") {
    searchParams.search_key = query.search_key;
    searchParams.search_value = query.search_value;
  }
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderGenbaSuccessResponse>("/admin/order/genba-success", { searchParams });
};

// legacy genba_order_view.php + Genba::runGenbaGetOrder(ByCtid)Async — 단건 조회(외부 API). search_value 있을 때만 호출.
export const fetchOrderGenbaView = (query: OrderGenbaViewSearch) =>
  apiClient.get<OrderGenbaViewResponse>("/admin/order/genba-order-view", {
    searchParams: { search_type: query.search_type, search_value: query.search_value },
  });

// legacy order_vaultn_success.php + AdminOrder::getOrderVaultnSuccess — tbl_order_item_vaultn 주문완료(reg_date desc, 20/page).
export const fetchOrderVaultnSuccess = (query: OrderVaultnSuccessSearch) => {
  const searchParams: Record<string, string> = { page: String(query.page) };
  if (query.search_ordno !== "") searchParams.search_ordno = query.search_ordno;
  if (query.search_m_id !== "") searchParams.search_m_id = query.search_m_id;
  if (query.search_start_date !== "") searchParams.search_start_date = query.search_start_date;
  if (query.search_end_date !== "") searchParams.search_end_date = query.search_end_date;
  return apiClient.get<OrderVaultnSuccessResponse>("/admin/order/vaultn-success", { searchParams });
};

// legacy vaultn_order_view.php + Vaultn::runRetrieveOrder — 단건 조회(외부 API). search_value 있을 때만 호출.
export const fetchOrderVaultnView = (query: OrderVaultnViewSearch) =>
  apiClient.get<OrderVaultnViewResponse>("/admin/order/vaultn-order-view", {
    searchParams: { search_type: query.search_type, search_value: query.search_value },
  });

// legacy order_view.php — 주문 상세 집계 조회(주문/항목/발송·배송/배송지/로그). settle_no 있을 때만 호출.
export const fetchOrderDetail = (query: OrderDetailSearch) =>
  apiClient.get<OrderDetailResponse>("/admin/order/detail", {
    searchParams: { settle_no: query.settle_no },
  });

// legacy order_licence.php — 키확인(Asset.runReserveAdmin / PointNexus 라이브 조회). 버튼 클릭 시 POST.
export const fetchOrderLicence = (body: OrderLicenceRequest) =>
  apiClient.post<OrderLicenceResponse>("/admin/order/licence", body);

// legacy order_ps.php mode=kcp_refund — KCP 결제취소/계좌반납(Kcp::cancelPayment). 백엔드 처리.
export const fetchKcpRefund = (body: OrderKcpRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/kcp-refund", body);

// legacy order_ps.php mode=toss_adapter_refund — toss_bank 계좌이체 결제취소. 백엔드 처리.
export const fetchTossAdapterRefund = (body: OrderTossAdapterRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/toss-adapter-refund", body);

// legacy order_ps.php mode=toss_refund — 일반 toss 부분취소(Tossadapter::cancelPayment). 백엔드 처리.
export const fetchTossRefund = (body: OrderTossRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/toss-refund", body);

// legacy order_ps.php mode=tosspay_refund — 토스페이 부분취소. 백엔드 처리(refundNo 생성 포함).
export const fetchTosspayRefund = (body: OrderTosspayRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/tosspay-refund", body);

// legacy order_ps.php mode=payco_refund — PAYCO 결제취소(PaycoPG::paycoCancel). 백엔드 처리.
export const fetchPaycoRefund = (body: OrderPaycoRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/payco-refund", body);

// legacy order_ps.php mode=payco_cancel — PAYCO 계좌반납(무통장 입금만료). 백엔드 처리.
export const fetchPaycoCancel = (body: OrderPaycoRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/payco-cancel", body);

// legacy order_ps.php mode=naverpay_refund — 네이버페이 결제취소(NaverPay cancel). 백엔드 처리.
export const fetchNaverpayRefund = (body: OrderNaverpayRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/naverpay-refund", body);

// legacy order_ps.php mode=order_item_cancel — 주문항목 취소. 백엔드 처리.
export const fetchOrderItemCancel = (body: OrderItemCancelRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/item-cancel", body);

// legacy order_ps.php mode=order_reject — 취소요청 반려. 백엔드 처리.
export const fetchOrderReject = (body: OrderRejectRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/reject", body);

// legacy order_ps.php mode=resend — 재발송(키발급 재시도). 백엔드 처리.
export const fetchOrderResend = (body: OrderResendRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/resend", body);

// legacy order_ps.php mode=register_tracking_no_item — 운송장 등록. 백엔드 처리.
export const fetchTrackingRegister = (body: OrderTrackingRegisterRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/tracking-register", body);

// legacy order_ps.php mode=memo_add — 관리자 메모. admin_id는 백엔드 세션.
export const fetchOrderMemoAdd = (body: OrderMemoAddRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/memo-add", body);

// legacy order_ps.php mode=point_refund — 사용적립금 반환. 백엔드 처리.
export const fetchPointRefund = (body: OrderPointRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/point-refund", body);

// legacy order_ps.php mode=order_refund — 결제취소 + 사용적립금 반환. 백엔드 처리.
export const fetchOrderRefund = (body: OrderPointRefundRequest) =>
  apiClient.post<{ success: boolean }>("/admin/order/order-refund", body);

// legacy order_detail.php — Payco 결제 상세정보 검증(paycoGetDetailForVerify). 팝업 표시용.
export const fetchPaycoDetail = (body: OrderPaycoDetailRequest) =>
  apiClient.post<OrderPaycoDetailResponse>("/admin/order/payco-detail", body);

// legacy order_asset_key.php — ordno 단건 조회(주문 요약 + Asset 키). runReserveAdmin(Asset 3.3)은 백엔드.
export const fetchOrderAssetKey = (ordno: string) =>
  apiClient.get<OrderAssetKeyResponse>("/admin/order/asset-key", {
    searchParams: { ordno },
  });

// legacy order_asset_key_bulk.php — 여러 ordno 일괄 조회(POST). 파싱·상한은 프론트, ordno별 조회는 백엔드.
export const fetchOrderAssetKeyBulk = (ordnos: string[]) =>
  apiClient.post<OrderAssetKeyBulkResponse>("/admin/order/asset-key-bulk", { ordnos });
