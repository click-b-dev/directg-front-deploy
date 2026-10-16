"use client";

import { useSplide } from "@shared/lib/use-splide";
import { MobileBestCard, type BestTitle } from "@entities/best-title";

/**
 * legacy `#main_best` splide3 옵션. grid는 확장 미마운트로 무효 → core 옵션(perPage 2)만.
 * (`_foundation`/게임리스트 분석 참조: `window.splideN.Extensions`는 undefined.)
 */
const MAIN_BEST_OPTIONS = {
  perPage: 2,
  perMove: 1,
  pagination: false,
  arrows: false,
  drag: true,
  flickMaxPages: 1,
};

/**
 * 모바일 인기게임 섹션 (legacy `mobile/index.php` `#main_best`, L495~574).
 * `getBestTitles(10)` 재사용. 순위는 1부터. splide carousel-multiple(perPage 2).
 */
export function MobileBestGameSection({ titles }: { titles: BestTitle[] }) {
  const ref = useSplide<HTMLDivElement>(MAIN_BEST_OPTIONS);

  return (
    <div className="section mb-2">
      <div className="section-title py-2 px-0">
        <h2 className="mb-0">인기게임</h2>
      </div>
      <div className="carousel-multiple splide" id="main_best" ref={ref}>
        <div className="splide__track">
          <ul className="splide__list">
            {titles.map((title, index) => (
              <MobileBestCard key={index} title={title} ranking={index + 1} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
