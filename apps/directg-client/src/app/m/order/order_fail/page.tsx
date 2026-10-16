import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { MobileOrderFailScreen } from "@screens/mobile-order-fail";

/** legacy mobile order/order_fail.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile order/order_fail.html head: title="주문실패", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "주문실패",
  description: "",
  keywords: "",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const firstParam = (value: string | string[] | undefined): string =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function MobileOrderFailPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireMemberSession(); // legacy login_check.php 가드
  const sp = await searchParams;
  return <MobileOrderFailScreen msg={firstParam(sp.msg)} message={firstParam(sp.message)} />;
}
