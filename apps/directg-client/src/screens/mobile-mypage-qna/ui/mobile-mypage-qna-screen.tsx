import type { QnaRow } from "@entities/mypage-qna";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileQnaAccordion } from "./mobile-qna-accordion";

interface MobileMypageQnaScreenProps {
  list: QnaRow[];
  totalPages: number;
}

/**
 * 모바일 마이페이지 - 문의 내역 (legacy `mobile/mypage/mypage_qna.html`).
 * MobileSubHeader("문의 내역") + section-title + Bootstrap 아코디언 + 더보기. 검색폼/페이지네이션 없음.
 */
export function MobileMypageQnaScreen({ list, totalPages }: MobileMypageQnaScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="문의 내역" />
      <div id="appCapsuleSub">
        <div className="section full">
          <div>
            <div className="section-title mt-2">문의 내역</div>
            <MobileQnaAccordion initialList={list} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </>
  );
}
