"use client";

import { useSplide } from "@shared/lib/use-splide";
import { MobileNewGameCard, type ProductThumb } from "@entities/product-thumb";

/** legacy `#main_new` splide2 옵션. grid 무효 → core 옵션(perPage 2)만. */
const MAIN_NEW_OPTIONS = {
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
};

/**
 * 모바일 신규게임 섹션 (legacy `mobile/index.php` `#main_new`, L576~662).
 * `getNewGames(8)` 재사용. 전체보기(`/game/game_thumb.html`, 쿼리 없음). splide carousel-multiple(perPage 2).
 */
export function MobileNewGameSection({ games }: { games: ProductThumb[] }) {
  const ref = useSplide<HTMLDivElement>(MAIN_NEW_OPTIONS);

  return (
    <div className="section">
      <div className="section-title py-2 px-0">
        <div className="d-flex justify-content-between align-items-end w-100">
          <h2 className="mb-0">신규게임</h2>
          <a href="/game/game_thumb" className="btn btn-outline-primary btn-allview">
            전체보기
          </a>
        </div>
      </div>
      <div className="carousel-multiple splide" id="main_new" ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {games.map((game, index) => (
              <MobileNewGameCard key={index} product={game} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
