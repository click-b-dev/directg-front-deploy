import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGoodsListItems } from "./mobile-goods-list-items";

interface MobileGoodsListScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 액세서리 list 목록 (legacy `mobile/game/goods_list.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`. base where=accessories(필터 product_type 주입).
 * goods_thumb과 동형·카드만 `MobileListCard`. legacy aside → 상품유형·플랫폼·한국어·장르 블록 숨김.
 */
export function MobileGoodsListScreen({ data, filters }: MobileGoodsListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="PS액세서리" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ productType: false, platform: false, korean: false, genre: false }}
          total={data.total}
          viewBasePath="/game/goods"
          pageType="list"
        />
        <MobileGoodsListItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
