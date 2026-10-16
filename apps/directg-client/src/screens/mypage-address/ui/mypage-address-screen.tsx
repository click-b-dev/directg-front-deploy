import type { MemberAddress } from "@entities/mypage-address";
import { MypageAside } from "@widgets/mypage-aside";

import { AddressForm } from "./address-form";

interface MypageAddressScreenProps {
  data: MemberAddress;
}

/**
 * 배송지 (legacy `pc/mypage/mypage_address.html`). 세션 폼. aside + 배송지 폼(client).
 * legacy 구조: main 직속 폼(section#content 래퍼 없음). 가드는 route.
 */
export function MypageAddressScreen({ data }: MypageAddressScreenProps) {
  return (
    <div className="container my-3 pb-5">
      <main className="d-grid gap-3" style={{ gridTemplateColumns: "240px auto" }}>
        <MypageAside active="profile" />
        <AddressForm data={data} />
      </main>
    </div>
  );
}
