import type { Metadata, Viewport } from "next";

import { getCart } from "@entities/cart/api/get-cart";
import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileOrderCartScreen } from "@screens/mobile-order-cart";

/** legacy mobile order/cart.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile order/cart.html head: title="장바구니", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "장바구니",
  description: "",
  keywords: "",
};

export default async function MobileOrderCartPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const { list } = await getCart();
  return <MobileOrderCartScreen items={list} />;
}
