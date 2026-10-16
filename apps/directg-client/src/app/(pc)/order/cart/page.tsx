import type { Metadata, Viewport } from "next";

import { getCart } from "@entities/cart/api/get-cart";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { OrderCartScreen } from "@screens/order-cart";

/** legacy `pc/order/cart.html` head. title="장바구니", 빈 description/author, canonical/OG 없음. */
export const metadata: Metadata = {
  title: "장바구니",
  description: "",
  authors: [{ name: "" }],
};

/** legacy cart.html: width=device-width, initial-scale=1.0. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function OrderCartPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list } = await getCart();
  return <OrderCartScreen items={list} />;
}
