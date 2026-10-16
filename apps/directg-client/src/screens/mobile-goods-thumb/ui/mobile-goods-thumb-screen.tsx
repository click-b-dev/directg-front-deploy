import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGoodsThumbItems } from "./mobile-goods-thumb-items";

interface MobileGoodsThumbScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 액세서리 thumb 목록 (legacy `mobile/game/goods_thumb.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`. base where=accessories(필터 product_type 주입).
 * legacy aside: platform/genre/korean/product_type(accessories) → 상품유형·플랫폼·한국어·장르 블록 숨김(검색필터+가격만).
 */
export function MobileGoodsThumbScreen({ data, filters }: MobileGoodsThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="PS액세서리" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ productType: false, platform: false, korean: false, genre: false }}
          total={data.total}
          viewBasePath="/game/goods"
          pageType="thumb"
        />
        <MobileGoodsThumbItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
