import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileHolomodelsListItems } from "./mobile-holomodels-list-items";

interface MobileHolomodelsListScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 홀로모델 list 목록 (legacy `mobile/game/holomodels_list.html`).
 * holomodels_thumb과 동형·카드만 `MobileListCard`. base where=holomodels(필터 product_type 주입).
 * legacy aside → 상품유형·플랫폼·한국어·장르 블록 숨김.
 */
export function MobileHolomodelsListScreen({ data, filters }: MobileHolomodelsListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="홀로 모델" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ productType: false, platform: false, korean: false, genre: false }}
          total={data.total}
          viewBasePath="/game/holomodels"
          pageType="list"
        />
        <MobileHolomodelsListItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
