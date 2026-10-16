"use client";

import { useSplide } from "@shared/lib/use-splide";
import { MobilePreorderCard, type ProductThumb } from "@entities/product-thumb";

/** legacy `#main_preorder` splide4 옵션. grid 무효 → core 옵션(perPage 2)만. */
const MAIN_PREORDER_OPTIONS = {
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
};

/**
 * 모바일 예약구매 섹션 (legacy `mobile/index.php` `#main_preorder`, L677~779).
 * `count>0`일 때만. `getPreorderGames(12)` 재사용. 전체보기(`/game/game_thumb?is_preorder=Y`).
 * splide carousel-multiple(perPage 2). POST 폼 없음(카드 링크만).
 */
export function MobilePreorderSection({ games }: { games: ProductThumb[] }) {
  const ref = useSplide<HTMLDivElement>(MAIN_PREORDER_OPTIONS);

  if (games.length === 0) return null;

  return (
    <div className="section">
      <div className="section-title py-2 px-0">
        <div className="d-flex justify-content-between align-items-end w-100">
          <h2 className="mb-0">예약구매</h2>
          <a href="/game/game_thumb?is_preorder=Y" className="btn btn-outline-primary btn-allview">
            전체보기
          </a>
        </div>
      </div>
      <div className="carousel-multiple splide" id="main_preorder" ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {games.map((game, index) => (
              <MobilePreorderCard key={index} product={game} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
