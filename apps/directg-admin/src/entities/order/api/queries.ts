import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOrderPaymentReady,
  fetchOrderPaymentApproved,
  fetchOrderVbank,
  fetchOrderAll,
  fetchOrderReadyList,
  fetchOrderSuccess,
  fetchOrderCancelRequest,
  fetchOrderCancelComplete,
  fetchOrderOldList,
  fetchOrderShipmentAll,
  fetchOrderShipmentPending,
  fetchOrderShipmentReady,
  shipOrderShipment,
  fetchOrderShipmentShipping,
  shipCompleteOrderShipment,
  fetchOrderShipmentDelivered,
  confirmPurchaseOrderShipment,
  fetchOrderShipmentConfirm,
  fetchOrderAssetSuccess,
  fetchOrderAssetKey,
  fetchOrderAssetKeyBulk,
  fetchOrderZtormSuccess,
  fetchOrderZtormView,
  fetchOrderGenbaSuccess,
  fetchOrderGenbaView,
  fetchOrderVaultnSuccess,
  fetchOrderVaultnView,
  fetchOrderDetail,
  fetchOrderLicence,
  fetchKcpRefund,
  fetchTossAdapterRefund,
  fetchTossRefund,
  fetchTosspayRefund,
  fetchPaycoRefund,
  fetchPaycoCancel,
  fetchNaverpayRefund,
  fetchOrderItemCancel,
  fetchOrderReject,
  fetchOrderResend,
  fetchTrackingRegister,
  fetchOrderMemoAdd,
  fetchPointRefund,
  fetchOrderRefund,
  fetchPaycoDetail,
} from "./fetcher";
import type {
  OrderPaymentReadySearch,
  OrderVbankSearch,
  OrderAllSearch,
  OrderReadySearch,
  OrderSuccessSearch,
  OrderCancelRequestSearch,
  OrderCancelCompleteSearch,
  OrderOldListSearch,
  OrderShipmentAllSearch,
  OrderShipmentFixedSearch,
  OrderShipmentShippingRequest,
  OrderShipmentShippedRequest,
  OrderAssetSuccessSearch,
  OrderZtormSuccessSearch,
  OrderZtormViewSearch,
  OrderGenbaSuccessSearch,
  OrderGenbaViewSearch,
  OrderVaultnSuccessSearch,
  OrderVaultnViewSearch,
  OrderDetailSearch,
  OrderLicenceRequest,
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
} from "../model/types";

const ORDER_KEY = ["admin", "order"] as const;

export const useOrderPaymentReady = (search: OrderPaymentReadySearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "payment-ready", search] as const,
    queryFn: () => fetchOrderPaymentReady(search),
  });

export const useOrderPaymentApproved = (search: OrderPaymentReadySearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "payment-approved", search] as const,
    queryFn: () => fetchOrderPaymentApproved(search),
  });

export const useOrderVbank = (search: OrderVbankSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "vbank", search] as const,
    queryFn: () => fetchOrderVbank(search),
  });

export const useOrderAll = (search: OrderAllSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "all", search] as const,
    queryFn: () => fetchOrderAll(search),
  });

export const useOrderReadyList = (search: OrderReadySearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "ready", search] as const,
    queryFn: () => fetchOrderReadyList(search),
  });

export const useOrderSuccess = (search: OrderSuccessSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "success", search] as const,
    queryFn: () => fetchOrderSuccess(search),
  });

export const useOrderCancelRequest = (search: OrderCancelRequestSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "cancel-request", search] as const,
    queryFn: () => fetchOrderCancelRequest(search),
  });

export const useOrderCancelComplete = (search: OrderCancelCompleteSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "cancel-complete", search] as const,
    queryFn: () => fetchOrderCancelComplete(search),
  });

export const useOrderOldList = (search: OrderOldListSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "old", search] as const,
    queryFn: () => fetchOrderOldList(search),
  });

export const useOrderShipmentAll = (search: OrderShipmentAllSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "shipment-all", search] as const,
    queryFn: () => fetchOrderShipmentAll(search),
  });

export const useOrderShipmentPending = (search: OrderShipmentFixedSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "shipment-pending", search] as const,
    queryFn: () => fetchOrderShipmentPending(search),
  });

export const useOrderShipmentReady = (search: OrderShipmentFixedSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "shipment-ready", search] as const,
    queryFn: () => fetchOrderShipmentReady(search),
  });

// legacy order_ps.php mode=shipment_shipping 성공 → location.reload() = 목록 invalidate.
export const useShipOrderShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderShipmentShippingRequest) => shipOrderShipment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

export const useOrderShipmentShipping = (search: OrderShipmentFixedSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "shipment-shipping", search] as const,
    queryFn: () => fetchOrderShipmentShipping(search),
  });

// legacy order_ps.php mode=shipment_shipped 성공 → location.reload() = 목록 invalidate.
export const useShipCompleteOrderShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderShipmentShippedRequest) => shipCompleteOrderShipment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

export const useOrderShipmentDelivered = (search: OrderShipmentFixedSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "shipment-delivered", search] as const,
    queryFn: () => fetchOrderShipmentDelivered(search),
  });

export const useOrderShipmentConfirm = (search: OrderShipmentFixedSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "shipment-confirm", search] as const,
    queryFn: () => fetchOrderShipmentConfirm(search),
  });

export const useOrderAssetSuccess = (search: OrderAssetSuccessSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "asset-success", search] as const,
    queryFn: () => fetchOrderAssetSuccess(search),
  });

export const useOrderZtormSuccess = (search: OrderZtormSuccessSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "ztorm-success", search] as const,
    queryFn: () => fetchOrderZtormSuccess(search),
  });

// legacy: search_value 있을 때만 조회(단건).
export const useOrderZtormView = (search: OrderZtormViewSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "ztorm-view", search] as const,
    queryFn: () => fetchOrderZtormView(search),
    enabled: search.search_value !== "",
  });

export const useOrderGenbaSuccess = (search: OrderGenbaSuccessSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "genba-success", search] as const,
    queryFn: () => fetchOrderGenbaSuccess(search),
  });

// legacy: search_value 있을 때만 조회(단건).
export const useOrderGenbaView = (search: OrderGenbaViewSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "genba-view", search] as const,
    queryFn: () => fetchOrderGenbaView(search),
    enabled: search.search_value !== "",
  });

export const useOrderVaultnSuccess = (search: OrderVaultnSuccessSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "vaultn-success", search] as const,
    queryFn: () => fetchOrderVaultnSuccess(search),
  });

// legacy: search_value 있을 때만 조회(단건).
export const useOrderVaultnView = (search: OrderVaultnViewSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "vaultn-view", search] as const,
    queryFn: () => fetchOrderVaultnView(search),
    enabled: search.search_value !== "",
  });

// legacy order_view.php — settle_no 있을 때만 상세 조회.
export const useOrderDetail = (search: OrderDetailSearch) =>
  useQuery({
    queryKey: [...ORDER_KEY, "detail", search] as const,
    queryFn: () => fetchOrderDetail(search),
    enabled: search.settle_no !== "",
  });

// legacy order_licence.php — 키확인 버튼 클릭 시 온디맨드 조회(POST).
export const useOrderLicence = () =>
  useMutation({
    mutationFn: (body: OrderLicenceRequest) => fetchOrderLicence(body),
  });

// legacy order_ps.php mode=kcp_refund 성공 → location.reload() = 상세 invalidate.
export const useKcpRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderKcpRefundRequest) => fetchKcpRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=toss_adapter_refund 성공 → reload = 상세 invalidate.
export const useTossAdapterRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderTossAdapterRefundRequest) => fetchTossAdapterRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=toss_refund 성공 → reload = 상세 invalidate.
export const useTossRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderTossRefundRequest) => fetchTossRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=tosspay_refund 성공 → reload = 상세 invalidate.
export const useTosspayRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderTosspayRefundRequest) => fetchTosspayRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=payco_refund 성공 → reload = 상세 invalidate.
export const usePaycoRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderPaycoRefundRequest) => fetchPaycoRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=payco_cancel(계좌반납) 성공 → reload = 상세 invalidate.
export const usePaycoCancel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderPaycoRefundRequest) => fetchPaycoCancel(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=naverpay_refund 성공 → reload = 상세 invalidate.
export const useNaverpayRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderNaverpayRefundRequest) => fetchNaverpayRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=order_item_cancel 성공 → reload = 상세 invalidate.
export const useOrderItemCancel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderItemCancelRequest) => fetchOrderItemCancel(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=order_reject 성공 → reload = 상세 invalidate.
export const useOrderReject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderRejectRequest) => fetchOrderReject(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=resend 성공 → reload = 상세 invalidate.
export const useOrderResend = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderResendRequest) => fetchOrderResend(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=register_tracking_no_item 성공 → reload = 상세 invalidate.
export const useTrackingRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderTrackingRegisterRequest) => fetchTrackingRegister(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=memo_add — 성공 시 location.reload() 주석처리(미갱신 quirk) → invalidate 없음.
export const useOrderMemoAdd = () =>
  useMutation({
    mutationFn: (body: OrderMemoAddRequest) => fetchOrderMemoAdd(body),
  });

// legacy order_ps.php mode=point_refund 성공 → reload = 상세 invalidate.
export const usePointRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderPointRefundRequest) => fetchPointRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_ps.php mode=order_refund 성공 → reload = 상세 invalidate.
export const useOrderRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: OrderPointRefundRequest) => fetchOrderRefund(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};

// legacy order_detail.php — Payco 결제 상세정보 검증(온디맨드 조회, 팝업).
export const usePaycoDetail = () =>
  useMutation({
    mutationFn: (body: OrderPaycoDetailRequest) => fetchPaycoDetail(body),
  });

// legacy: ordno 있을 때만 조회(단건).
export const useOrderAssetKey = (ordno: string) =>
  useQuery({
    queryKey: [...ORDER_KEY, "asset-key", ordno] as const,
    queryFn: () => fetchOrderAssetKey(ordno),
    enabled: ordno !== "",
  });

// legacy order_asset_key_bulk POST 조회 — 결과는 화면 state에 보관(mutation).
export const useOrderAssetKeyBulk = () =>
  useMutation({
    mutationFn: (ordnos: string[]) => fetchOrderAssetKeyBulk(ordnos),
  });

// legacy order_ps.php mode=actual_delivery 성공 → location.reload() = 목록 invalidate.
export const useConfirmPurchaseOrderShipment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrderShipmentShippedRequest) => confirmPurchaseOrderShipment(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDER_KEY }),
  });
};
