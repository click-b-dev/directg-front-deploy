import type { PromotionIngResponse } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobilePromotionIngLandingSort } from "./mobile-promotion-ing-landing-sort";
import { MobilePromotionIngLandingItems } from "./mobile-promotion-ing-landing-items";

interface MobilePromotionIngLandingScreenProps {
  data: PromotionIngResponse;
  sort: string;
}

const formatCount = (value: number) => value.toLocaleString("ko-KR");

/**
 * 모바일 진행중 프로모션 랜딩 (legacy `mobile/promotion/promotion_ing.html`, 무접미).
 * 총: N 개 + sort select(discount 포함, sort만 리셋) + search 카드 목록 + 더보기.
 * thumb/list와 달리 offcanvas 필터 없음(sort select만). 카드는 game_search 카드 재사용.
 */
export function MobilePromotionIngLandingScreen({
  data,
  sort,
}: MobilePromotionIngLandingScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="진행중인 프로모션" />
      <div id="appCapsuleSub" className="full-height">
        <div className="section full">
          <div className="wide-block pb-1 px-2">
            <div className="d-flex flex-row justify-content-between">
              <div className="py-2 align-self-center flex-fill flex-grow-1">
                <span className="align-middle">총: {formatCount(data.total)} 개</span>
              </div>
              <MobilePromotionIngLandingSort sort={sort} />
            </div>
          </div>
        </div>
        <MobilePromotionIngLandingItems
          initialList={data.list}
          totalPages={data.totalPages}
          sort={sort}
        />
      </div>
    </>
  );
}
