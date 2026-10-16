import type { ProductFilterParams, PromotionIngResponse } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobilePromotionIngThumbList } from "./mobile-promotion-ing-thumb-list";

interface MobilePromotionIngThumbScreenProps {
  data: PromotionIngResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 할인진행중 목록 (legacy `mobile/promotion/promotion_ing_thumb.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(공용 offcanvas 필터, promotion 체크박스 숨김).
 */
export function MobilePromotionIngThumbScreen({
  data,
  filters,
}: MobilePromotionIngThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="진행중인 프로모션" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ promotion: false }}
          total={data.total}
          viewBasePath="/promotion/promotion_ing"
          pageType="thumb"
        />
        <MobilePromotionIngThumbList
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
