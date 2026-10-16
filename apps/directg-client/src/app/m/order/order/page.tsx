import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getOrderCheckout } from "@entities/order/api/get-order-checkout";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileOrderOrderScreen } from "@screens/mobile-order-order";

/** legacy mobile order/order.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile order/order.html head: title="주문하기", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주문하기",
  description: "",
  keywords: "",
};

export default async function MobileOrderOrderPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const checkout = await getOrderCheckout();
  // legacy: 주문상품 0건 → 장바구니로 강제 이동
  if (checkout.items.length === 0) redirect("/order/cart");
  return (
    <MobileOrderOrderScreen
      items={checkout.items}
      memberEmoney={checkout.member_emoney}
      isDeliveryAddress={checkout.is_delivery_address}
    />
  );
}
