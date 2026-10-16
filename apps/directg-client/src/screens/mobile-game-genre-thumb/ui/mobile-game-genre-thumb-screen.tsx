import type { GameGenreResponse } from "@entities/game-genre";
import type { ProductFilterParams } from "@entities/promotion-ing";
import { MobileSubHeader } from "@widgets/mobile-sub-header";

import { MobileGameGenreThumbList } from "./mobile-game-genre-thumb-list";

interface MobileGameGenreThumbScreenProps {
  data: GameGenreResponse;
  genreCode: string;
  filters: ProductFilterParams;
}

/**
 * 모바일 장르별 게임 목록 (legacy `mobile/game/game_genre_thumb.html`). 공개 SSR page1 + "더보기" 증분.
 * 헤더(pageTitle=genreName=getPrimaryGenreName) + appCapsuleSub + thumb 카드 목록.
 * PC와 달리 장르 베스트 캐러셀 없음. game_filter offcanvas는 후속 단위.
 */
export function MobileGameGenreThumbScreen({
  data,
  genreCode,
  filters,
}: MobileGameGenreThumbScreenProps) {
  return (
    <>
      <MobileSubHeader pageTitle={data.genreName} />
      <div id="appCapsuleSub" className="full-height">
        {/* game_filter offcanvas — 후속 단위 */}
        <MobileGameGenreThumbList
          initialList={data.list}
          totalPages={data.totalPages}
          genreCode={genreCode}
          filters={filters}
        />
      </div>
    </>
  );
}
