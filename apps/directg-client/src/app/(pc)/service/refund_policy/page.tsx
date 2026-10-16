import type { Metadata, Viewport } from "next";

import { ServiceRefundPolicyScreen } from "@screens/service-refund-policy";

/** legacy `pc/service/refund_policy.html` head. title="다이렉트 게임즈 환불정책", 빈 description, author=H2interactive. canonical/OG 없음. */
export const metadata: Metadata = {
  title: "다이렉트 게임즈 환불정책",
  description: "",
  authors: [{ name: "H2interactive" }],
};

/** legacy refund_policy.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceRefundPolicyPage() {
  return <ServiceRefundPolicyScreen />;
}
