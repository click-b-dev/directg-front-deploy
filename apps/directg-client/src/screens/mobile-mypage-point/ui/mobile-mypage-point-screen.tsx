import type { MypagePointList } from "@entities/mypage-point";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileMypagePointList } from "./mobile-mypage-point-list";

/** legacy `mypage_point.html` head `<style>`(₩ 접두). */
const POINT_CSS = `
.won::before {
	content: "\\20a9";
}
`;

/**
 * 모바일 마이페이지 - 포인트 내역 (legacy `mobile/mypage/mypage_point.html`).
 * MobileSubHeader + 보유 포인트 카드 + 포인트 표/더보기(client). 세션 가드·초기 조회는 라우트.
 */
export function MobileMypagePointScreen({ data }: { data: MypagePointList }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: POINT_CSS }} />
      <MobileSubHeader pageTitle="포인트 내역" />
      <div id="appCapsuleSub">
        <div className="section pt-2 full">
          <div className="col-12 mb-1">
            <div className="card shadow-none rounded-0">
              <div className="card-body p-2 overflow-auto">
                고객님께서 보유하신 포인트는 {data.member_emoney.toLocaleString()}원 입니다.
              </div>
            </div>
          </div>

          <MobileMypagePointList initialList={data.list} totalPages={data.totalPages} />
        </div>
      </div>
    </>
  );
}
