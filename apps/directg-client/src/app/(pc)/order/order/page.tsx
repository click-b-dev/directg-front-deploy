import type { Metadata, Viewport } from "next";
import { redirect } from "next/navigation";

import { getOrderCheckout } from "@entities/order/api/get-order-checkout";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { OrderOrderScreen } from "@screens/order-order";

/** legacy `pc/order/order.html` head. title="주문하기", 빈 description/author, canonical/OG 없음. */
export const metadata: Metadata = {
  title: "주문하기",
  description: "",
  authors: [{ name: "" }],
};

/** legacy order.html: width=device-width, initial-scale=1.0. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function OrderOrderPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const checkout = await getOrderCheckout();
  // legacy: 주문상품 0건이면 강제로 장바구니 이동
  if (checkout.items.length === 0) redirect("/order/cart");
  return <OrderOrderScreen checkout={checkout} />;
}
