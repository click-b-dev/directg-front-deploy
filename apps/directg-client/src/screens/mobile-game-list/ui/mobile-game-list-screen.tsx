import type { GameListResponse } from "@entities/game-list";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGameListItems } from "./mobile-game-list-items";

interface MobileGameListScreenProps {
  data: GameListResponse;
  filters: ProductFilterParams;
}

/**
 * 모바일 전체게임 목록 list 뷰 (legacy `mobile/game/game_list.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(공용 offcanvas 필터).
 * thumb 뷰(game_thumb)와 데이터/더보기 동일, 카드만 `MobileListCard`(가로형).
 * legacy game_list.html은 aside 미설정 → 필터 5블록 전부 노출(프로모션 체크박스 포함).
 */
export function MobileGameListScreen({ data, filters }: MobileGameListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle="모든게임" />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter aside={{}} total={data.total} viewBasePath="/game/game" pageType="list" />
        <MobileGameListItems
          initialList={data.list}
          totalPages={data.totalPages}
          filters={filters}
        />
      </div>
    </>
  );
}
