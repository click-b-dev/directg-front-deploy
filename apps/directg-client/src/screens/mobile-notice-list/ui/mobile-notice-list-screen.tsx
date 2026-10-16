import type { NoticeListResponse } from "@entities/board-notice";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileNoticeList } from "./mobile-notice-list";

/**
 * 모바일 공지사항 목록 (legacy `mobile/board/notice.html`). 서브페이지 셸 + 더보기 증분 목록.
 */
export function MobileNoticeListScreen({ data }: { data: NoticeListResponse }) {
  return (
    <>
      <MobileSubHeader pageTitle="공지사항" />
      <div id="appCapsuleSub">
        <MobileNoticeList initialList={data.list} totalPages={data.totalPages} />
      </div>
    </>
  );
}
