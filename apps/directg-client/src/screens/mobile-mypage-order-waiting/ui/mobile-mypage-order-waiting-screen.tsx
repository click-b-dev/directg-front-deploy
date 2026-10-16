import { MobileSubHeader } from "@widgets/mobile-sub-header";

import type { MobileWaitingCard } from "../lib/flatten-waiting";
import { MobileMypageOrderWaitingList } from "./mobile-mypage-order-waiting-list";

/** legacy `mypage_order_wating.html` head `<style>`(searchbox dark) — body 검색박스 없어 dead지만 head 재현. */
const WAITING_CSS = `
body.dark-mode-active .searchbox .form-control{
	color:#dee2e6;
}
`;

interface MobileMypageOrderWaitingScreenProps {
  list: MobileWaitingCard[];
  totalPages: number;
}

/**
 * 모바일 마이페이지 - 입금대기 내역 (legacy `mobile/mypage/mypage_order_wating.html`).
 * title/헤더는 "주문완료 내역" quirk. 검색폼 없음. 입금대기/입금마감 배지 + 카드/더보기(client).
 * 세션 가드·조회·평면화는 라우트.
 */
export function MobileMypageOrderWaitingScreen({
  list,
  totalPages,
}: MobileMypageOrderWaitingScreenProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: WAITING_CSS }} />
      <MobileSubHeader pageTitle="주문완료 내역" />
      <div id="appCapsuleSub">
        <MobileMypageOrderWaitingList initialList={list} totalPages={totalPages} />
      </div>
    </>
  );
}
