import type { WaitingOrder } from "@entities/mypage-order";

/**
 * 모바일 입금대기 카드 1건 (legacy `mobile/mypage/mypage_order_wating.html` foreach row).
 * PC grouped `WaitingOrder`를 order_item 단위로 평면화한 뷰 모델. deposit_status/order_date/settle_no는
 * order-level, delivery_type/product_name/price/shipment_status는 item-level.
 */
export interface MobileWaitingCard {
  order_date: string;
  settle_no: string;
  /** 백엔드 판정 입금 상태 — "closed"=입금마감 / "waiting"=입금대기. */
  deposit_status: "waiting" | "closed";
  delivery_type: string;
  product_name: string;
  price: number;
  shipment_status: string | null;
}

/**
 * grouped `WaitingOrder[]` → 평면 카드 목록 (settle_no당 멀티아이템은 카드 여러 개로 분리, legacy 평면 렌더 재현).
 */
export function flattenWaitingOrders(orders: WaitingOrder[]): MobileWaitingCard[] {
  return orders.flatMap((order) =>
    order.items.map((item) => ({
      order_date: order.order_date,
      settle_no: order.settle_no,
      deposit_status: order.deposit_status,
      delivery_type: item.delivery_type,
      product_name: item.product_name,
      price: item.price,
      shipment_status: item.shipment_status ?? null,
    })),
  );
}
