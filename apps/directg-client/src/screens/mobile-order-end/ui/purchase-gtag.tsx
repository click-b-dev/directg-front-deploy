"use client";

import { useEffect } from "react";

import type { OrderCompleteItem, OrderInfo } from "@entities/order";

/** GA4 gtag 안전 호출 (app/m/layout gtag 전역). */
function gtag(...args: unknown[]) {
  (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.(...args);
}

/** legacy mobile order_end.html: gtag('purchase') 1회 발화. */
export function MobilePurchaseGtag({
  orderInfo,
  items,
}: {
  orderInfo: OrderInfo;
  items: OrderCompleteItem[];
}) {
  useEffect(() => {
    gtag("event", "purchase", {
      transaction_id: orderInfo.settle_no,
      value: orderInfo.total_price,
      currency: "KRW",
      items: items.map((it) => ({
        item_id: it.goods_sku,
        item_name: it.product_name,
        price: it.price,
        quantity: 1,
      })),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
