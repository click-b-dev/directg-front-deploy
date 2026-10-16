import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGameThumbList } from "./mobile-game-thumb-list";

interface MobileGameThumbScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 전체게임 목록 (legacy `mobile/game/game_thumb.html`). 공개 SSR page1 + "더보기" 증분.
 * 헤더(pageTitle="모든게임") + appCapsuleSub + thumb 카드 목록.
 * game_filter offcanvas는 후속 단위(파일럿 범위 밖).
 */
export function MobileGameThumbScreen({ data, filters }: MobileGameThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="모든게임" />
      <div id="appCapsuleSub" className="full-height">
        {/* game_filter offcanvas — 후속 단위 */}
        <MobileGameThumbList
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
