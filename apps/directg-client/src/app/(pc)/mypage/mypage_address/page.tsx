import type { Metadata, Viewport } from "next";

import { requireMemberSession } from "@entities/member-auth/lib/require-member-session";
import { getMemberAddress } from "@entities/mypage-address/api/get-member-address";
import { MypageAddressScreen } from "@screens/mypage-address";

/**
 * legacy `pc/mypage/mypage_address.html` head. **title="계정 설정"**(배송지 아님, 복붙 잔재).
 * description/keywords는 템플릿 잔재, author 메타 없음. canonical/OG 없음.
 */
export const metadata: Metadata = {
  title: "계정 설정",
  description: "Bootstrap e-commerce html template similar to Alibaba",
  keywords: "Online template, shop, theme, template, html, css, bootstrap 4",
};

/**
 * legacy address는 `width=device-width, initial-scale=1, shrink-to-fit=no`.
 * `shrink-to-fit=no`는 Bootstrap4/iOS9용 deprecated no-op 속성이며 Next Viewport API로 표현 불가 → 드롭(동작 무영향).
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function MypageAddressPage() {
  await requireMemberSession(); // legacy login_check.php 가드
  const data = await getMemberAddress();
  return <MypageAddressScreen data={data} />;
}
