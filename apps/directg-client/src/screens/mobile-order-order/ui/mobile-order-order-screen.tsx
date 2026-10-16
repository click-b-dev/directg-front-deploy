import type { OrderItem } from "@entities/order";
import { MobileFooterBanner } from "@widgets/mobile-footer-banner";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileOrderForm } from "./mobile-order-form";

interface MobileOrderOrderScreenProps {
  items: OrderItem[];
  memberEmoney: number;
  isDeliveryAddress: boolean;
}

/** legacy toss event.svg 기간게이트 2026-03-19 00:00:00 ~ 2026-11-30 23:59:59. */
const isTossEventOpen = (now: Date) =>
  now >= new Date("2026-03-19T00:00:00") && now < new Date("2026-11-30T23:59:59");

/** legacy naverpay 이벤트 배너 기간게이트 2025-11-14 00:00:00 ~ 2025-12-03 23:59:00(현재 만료). */
const isNaverEventOpen = (now: Date) =>
  now >= new Date("2025-11-14T00:00:00") && now < new Date("2025-12-03T23:59:00");

/**
 * 모바일 주문서 (legacy `mobile/order/order.html`).
 * 서버 셸: MobileSubHeader("주문하기") + `#appCapsuleSub.full-height` + 폼(client). 기간게이트/배너는 서버 평가.
 */
export function MobileOrderOrderScreen({
  items,
  memberEmoney,
  isDeliveryAddress,
}: MobileOrderOrderScreenProps) {
  const now = new Date();
  // legacy hidden delivery_type = 마지막 항목 delivery_type(제출 시 배송지 필수 판정 quirk).
  const deliveryType = items.length > 0 ? items[items.length - 1].delivery_type : "";

  return (
    <>
      <MobileSubHeader pageTitle="주문하기" />
      <div id="appCapsuleSub" className="full-height">
        <MobileOrderForm
          items={items}
          memberEmoney={memberEmoney}
          isDeliveryAddress={isDeliveryAddress}
          deliveryType={deliveryType}
          showTossEvent={isTossEventOpen(now)}
          showNaverEvent={isNaverEventOpen(now)}
          footerBanner={<MobileFooterBanner />}
        />
      </div>
    </>
  );
}
