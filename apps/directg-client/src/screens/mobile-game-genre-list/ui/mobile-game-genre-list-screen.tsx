import type { GameGenreResponse } from "@entities/game-genre";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";
import { MobileGameFilter } from "@widgets/mobile-game-filter";

import { MobileGameGenreListItems } from "./mobile-game-genre-list-items";

interface MobileGameGenreListScreenProps {
  data: GameGenreResponse;
  genreCode: string;
  filters: ProductFilterParams;
}

/**
 * 모바일 장르별 게임 목록 list 뷰 (legacy `mobile/game/game_genre_list.html`).
 * 공개 SSR page1 + "더보기" 증분 + `MobileGameFilter`(공용 offcanvas 필터).
 * game_list와 동형·카드만 `MobileListCard`. legacy `$aside['genre']="false"` → 필터 장르 블록 숨김.
 * PC와 달리 장르 베스트 캐러셀 없음(genre_thumb과 동일).
 */
export function MobileGameGenreListScreen({
  data,
  genreCode,
  filters,
}: MobileGameGenreListScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={data.genreName} />
      <div id="appCapsuleSub" className="full-height">
        <MobileGameFilter
          aside={{ genre: false }}
          total={data.total}
          viewBasePath="/game/game_genre"
          pageType="list"
        />
        <MobileGameGenreListItems
          initialList={data.list}
          totalPages={data.totalPages}
          genreCode={genreCode}
          filters={filters}
        />
      </div>
    </>
  );
}
