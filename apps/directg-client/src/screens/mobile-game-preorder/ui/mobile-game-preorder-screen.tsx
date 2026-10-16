import type { PreorderListResponse } from "@entities/preorder-list";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGamePreorderItems } from "./mobile-game-preorder-items";

const formatCount = (value: number) => value.toLocaleString("ko-KR");

/**
 * 모바일 예약구매 목록 (legacy `mobile/game/game_preorder.html`).
 * 공개 SSR page1 + "더보기" 증분. `총: N 개` + 타이틀 그리드(옵션 listview). offcanvas 필터는 legacy 주석처리(미이식).
 */
export function MobileGamePreorderScreen({ data }: { data: PreorderListResponse }) {
  return (
    <>
      <MobileSubHeader pageTitle="예약 구매" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full">
          <div className="wide-block pt-1 pb-1 px-2">
            <div className="d-flex justify-content-between align-items-center">
              <span>총: {formatCount(data.total)} 개</span>
            </div>
          </div>
        </div>
        <MobileGamePreorderItems initialList={data.list} totalPages={data.totalPages} />
      </div>
    </>
  );
}
