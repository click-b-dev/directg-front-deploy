import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileHolomodelsThumbItems } from "./mobile-holomodels-thumb-items";

interface MobileHolomodelsThumbScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 홀로모델 thumb 목록 (legacy `mobile/game/holomodels_thumb.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`. base where=holomodels(필터 product_type 주입).
 * goods 계열과 동형 — legacy aside(platform/korean/genre/product_type=holomodels)로 상품유형·플랫폼·한국어·장르 블록 숨김.
 */
export function MobileHolomodelsThumbScreen({ data, filters }: MobileHolomodelsThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="홀로 모델" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ productType: false, platform: false, korean: false, genre: false }}
          total={data.total}
          viewBasePath="/game/holomodels"
          pageType="thumb"
        />
        <MobileHolomodelsThumbItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
