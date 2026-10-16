import type { ProductFilterParams, PromotionIngResponse } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobilePromotionIngListItems } from "./mobile-promotion-ing-list-items";

interface MobilePromotionIngListScreenProps {
  data: PromotionIngResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 할인진행중 목록 list 뷰 (legacy `mobile/promotion/promotion_ing_list.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(공용 offcanvas 필터). thumb 뷰와 데이터/더보기 동일, 카드만 `MobileListCard`(가로형).
 */
export function MobilePromotionIngListScreen({ data, filters }: MobilePromotionIngListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="진행중인 프로모션" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ promotion: false }}
          total={data.total}
          viewBasePath="/promotion/promotion_ing"
          pageType="list"
        />
        <MobilePromotionIngListItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
