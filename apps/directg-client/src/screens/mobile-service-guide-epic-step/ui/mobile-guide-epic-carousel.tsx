"use client";

import type { ReactNode } from "react";

import { useSplide } from "@shared/lib/use-splide";

/**
 * Epic 이용가이드 캐러셀 shell — legacy `#carousel-slider.splide`(guide_epic_stepN 공통).
 * Steam의 `MobileGuideCarousel`(문자열 body)과 달리 epic 슬라이드는 인라인 링크/span/br을 포함해
 * JSX children으로 직접 전사한다. `ul.splide__list.text-start`(legacy epic 고유) 유지.
 * Splide 옵션 verbatim: type loop / perPage 1 / arrows false (grid gap은 perPage1이라 시각 무영향).
 */
const OPTIONS = {
  type: "loop",
  perPage: 1,
  perMove: 1,
  arrows: false,
};

export function MobileGuideEpicCarousel({ children }: { children: ReactNode }) {
  const ref = useSplide<HTMLDivElement>(OPTIONS);

  return (
    <div className="carousel-slider splide" id="carousel-slider" ref={ref}>
      <div className="splide__track">
        <ul className="splide__list text-start">{children}</ul>
      </div>
    </div>
  );
}
