import type { GiftItem } from "@entities/mypage-gift";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGiftList } from "./mobile-gift-list";

interface MobileMypageGiftScreenProps {
  list: GiftItem[];
}

/**
 * 모바일 마이페이지 - 사은품 내역 (legacy `mobile/mypage/mypage_gift.html`).
 * MobileSubHeader("사은품 내역") + 카드형 목록(client, 모달/Daum/배송조회 포함). 페이지네이션 없음.
 */
export function MobileMypageGiftScreen({ list }: MobileMypageGiftScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="사은품 내역" />
      <div id="appCapsuleSub">
        <MobileGiftList items={list} />
      </div>
    </>
  );
}
