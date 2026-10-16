import type { Metadata, Viewport } from "next";

import { MobileServiceRefundPolicyScreen } from "@screens/mobile-service-refund-policy";

/** legacy mobile refund_policy.html: width=device-width, scale 1 고정, viewport-fit=cover, theme-color #000. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

/** legacy mobile refund_policy.html head: title="다이렉트 게임즈 환불정책", description/keywords 빈값. */
export const metadata: Metadata = {
  title: "다이렉트 게임즈 환불정책",
  description: "",
  keywords: "",
};

/**
 * legacy mobile refund_policy.html head 인라인 style — 다크모드 표 스타일.
 * (head의 `pre{}` 규칙은 `<pre>` 요소가 없어 dead → 미이식. `.table*` 규칙만 유효하므로 이식.)
 */
const TABLE_STYLE = `.table{font-size:14px;border:1px;border-color:#495057;}body.dark-mode-active .table tr{border-color:#495057;border-style:initial;}.table th{background:#303D4E;}.table td{border-bottom:0;}.table-light{background:#191919 !important;color:#ffffff !important;}`;

export default function MobileServiceRefundPolicyPage() {
  return (
    <>
      <style>{TABLE_STYLE}</style>
      <MobileServiceRefundPolicyScreen />
    </>
  );
}
