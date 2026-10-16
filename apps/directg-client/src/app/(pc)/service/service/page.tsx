import type { Metadata, Viewport } from "next";

import { ServiceIntroScreen } from "@screens/service-intro";

/**
 * legacy `pc/service/service.html` head. title="다이렉트 게임즈 소개", 빈 description.
 * author도 **빈값**(`<meta name="author" content="">`). canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "다이렉트 게임즈 소개",
  description: "",
  authors: [{ name: "" }],
};

/** legacy service.html은 `width=device-width, initial-scale=1.0`. */
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function ServiceIntroPage() {
  return <ServiceIntroScreen />;
}
