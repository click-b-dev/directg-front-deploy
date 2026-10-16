import type { Metadata, Viewport } from "next";

import { ServiceYouthpolicyScreen } from "@screens/service-youthpolicy";

/**
 * legacy `pc/service/youthpolicy.html` head. title="청소년보호정책", 빈 description.
 * author도 **빈값**(`<meta name="author" content="">`) — epic 이용안내와 동일. canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "청소년보호정책",
  description: "",
  authors: [{ name: "" }],
};

/** legacy youthpolicy.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceYouthpolicyPage() {
  return <ServiceYouthpolicyScreen />;
}
